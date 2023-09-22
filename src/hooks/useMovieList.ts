import { useQuery, useQueryClient } from "react-query";
import { createTMDBRequest } from "../helpers/api";
import useLocalStorage from "./useLocalStorage";
import { MovieDto } from "../models/movie";
import { List, useMovieLists } from "./useMovieLists";
import { useState } from "react";

export default function useMovieList(id: string) {
  const { lists, updateLists } = useMovieLists();
  const list = lists.find((list) => list.id === id);
  const [page, setPage] = useState(0);
  const [hasValue, setHasValue] = useState(true);

  const queryId = `movieList-${id}`;
  const { value, saveValue } = useLocalStorage(id);
  const queryClient = useQueryClient();
  const movieIds: string[] = value ? JSON.parse(value) : [];
  const { data, isLoading } = useQuery<MovieDto[]>({
    queryKey: [queryId, page, movieIds],
    queryFn: () => getMovies(page),
    keepPreviousData: true,
    staleTime: 500,
  });

  const pageSize = 10;

  async function getMovies(page: number = 0) {
    const slicedMovieIds = movieIds.slice(
      page * pageSize,
      (page + 1) * pageSize
    );
    if (!slicedMovieIds.length && movieIds.length / pageSize <= page) {
      setHasValue(false);
    }

    const responses = slicedMovieIds.map(async (id) =>
      createTMDBRequest(`/movie/${id}`)
    );

    const response = (await Promise.all(responses)) as MovieDto[];
    const newData = [...(data || []), ...response] as MovieDto[];
    return newData;
  }

  function updateMovies(state: MovieDto[]) {
    const updated = queryClient.setQueryData(queryId, () => state);
    saveValue(JSON.stringify(updated.map((movie) => movie.id)));
  }

  function addMovies(newMovies: MovieDto[]) {
    updateMovies([...(data || []), ...newMovies]);
  }

  function reorderMovies(startIndex: number, endIndex: number) {
    const updated = [...(data || [])];
    const [removed] = updated.splice(startIndex, 1);
    updated.splice(endIndex, 0, removed);

    updateMovies(updated);
  }

  function removeMovie(movieId: number) {
    const updated = [...(data || [])];
    updateMovies(updated.filter((movie) => movie.id !== movieId));
  }

  function updateList(updatedList: List) {
    updateLists(
      lists.map((list) => {
        return list.id !== id ? list : { ...list, ...updatedList };
      })
    );
  }

  return {
    list,
    movies: data,
    isLoading,
    addMovies,
    reorderMovies,
    removeMovie,
    updateList,
    setPage,
    hasValue,
  };
}

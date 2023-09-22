import {
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { List } from "../../hooks/useMovieLists";
import { genres } from "../../helpers/const/ui";

interface InitializeMovieListProps {
  onSubmit: (list: Omit<List, "id">) => void;
}

export default function InitializeMovieListForm({
  onSubmit,
}: InitializeMovieListProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid }, // Access form errors
  } = useForm({
    defaultValues: { name: "", tags: [] as string[] },
  });

  const validateTags = (tags: string[]) => {
    return tags.length >= 2 || "Select at least 2 genres";
  };

  const handleFormSubmit = handleSubmit(
    ({ tags, name }) => {
      if (isValid) {
        onSubmit({ name, tags: tags.join(",") });
      }
    },
    (error) => {
      console.log("error: ", error);
    }
  );

  return (
    <form
      onSubmit={handleFormSubmit}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "20px",
        gap: "20px",
      }}
    >
      <Typography variant="h2" component="h2" sx={{ width: "100%" }}>
        New List
      </Typography>
      <TextField
        {...register("name", {
          required: "List Name is required",
          minLength: {
            value: 5,
            message: "List Name must be at least 5 characters long",
          },
        })}
        label="List Name"
        autoFocus
        fullWidth
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <FormControl fullWidth variant="outlined">
        <InputLabel>Genres</InputLabel>
        <Controller
          control={control}
          name="tags"
          rules={{
            validate: validateTags, // Apply custom validation function
          }}
          render={({ field }) => {
            return (
              <Select
                error={!!errors.tags}
                label="Genres"
                style={{ width: "100%" }}
                multiple
                onClose={() => {
                  field.onBlur();
                }}
                MenuProps={{
                  variant: "menu",
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
                displayEmpty={true}
                renderValue={(selected) => {
                  return (
                    selected
                      ?.filter((option) => !!option.length)
                      .map((option) => (
                        <Chip
                          label={option}
                          sx={{
                            marginLeft: "3px",
                          }}
                        />
                      )) || "Select some options"
                  );
                }}
                {...field}
              >
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    <Checkbox checked={field.value.indexOf(genre) >= 0} />
                    <ListItemText primary={genre} />
                  </MenuItem>
                ))}
              </Select>
            );
          }}
        />
      </FormControl>
      {errors.tags?.length && errors.tags.length < 2 && (
        <FormHelperText error>Select at least 2 genres.</FormHelperText>
      )}
      {errors.tags && (
        <FormHelperText error>{errors.tags.message}</FormHelperText>
      )}
      <Button type="submit" variant="contained" size="large">
        Confirm
      </Button>
    </form>
  );
}

import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    file: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");

    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("license", formData.file); // This is the file input

    try {
      const response = await axios.post("http://localhost:4000/api/doctor/requestToJoin", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccessMessage("You have successfully submitted your request. We will get back to you soon.");
      }
    } catch (error) {
      console.error("Error submitting the form:", error.response?.data?.message || error.message);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        padding: 3,
      }}
    >
      {!successMessage ? (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: 400,
            padding: 3,
            backgroundColor: "#fff",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" textAlign="center" marginBottom={2}>
            Join Our System as a Doctor
          </Typography>

          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <Button
            variant="contained"
            component="label"
            sx={{ marginTop: 2 }}
          >
            Upload License
            <input
              type="file"
              name="file"
              accept="image/*,application/pdf"
              hidden
              onChange={handleChange}
              required
            />
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: 3 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            padding: 3,
            backgroundColor: "#fff",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            borderRadius: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60, color: "green", marginBottom: 2 }} />
          <Typography variant="h6">{successMessage}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default RegisterDoctor;

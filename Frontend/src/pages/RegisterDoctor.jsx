import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    Fname: "",
    Lname: "",
    email: "",
    file: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file" && files[0]) {
      setFormData({ ...formData, file: files[0] });
      const fileUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(fileUrl);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    data.append("Fname", formData.Fname);
    data.append("Lname", formData.Lname);
    data.append("email", formData.email);
    if (formData.file) {
      data.append("license", formData.file); // This will be received as req.file in backend
    }

    try {
      const response = await axios.post("/api/doctor/requestToJoin", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
          setShowSuccessDialog(true);
        setFormData({
          Fname: "",
          Lname: "",
          email: "",
          file: null,
        });
        setPreviewUrl(null);
      }
    } catch (error) {
      alert("Error submitting request: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };
  const SuccessDialog = () => (
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center">
              Request Submitted Successfully!
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="text-center space-y-2 py-4">
          <p className="text-muted-foreground">
            Thank you for your interest in joining MediNearBy.
          </p>
          <p className="text-muted-foreground">
            Our team will review your application and get back to you via email soon.
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="default"
            onClick={() => setShowSuccessDialog(false)}
            className="w-full sm:w-auto"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  const removeFile = () => {
    setFormData({ ...formData, file: null });
    setPreviewUrl(null);
  };

  return (
    <>
    <Card className="border-0 shadow-none max-w-xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Join as a Doctor</h2>
        <p className="text-muted-foreground text-center">
          Submit your request to join MediNearBy as a healthcare provider
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Fname">First Name</Label>
              <Input
                id="Fname"
                name="Fname"
                required
                value={formData.Fname}
                onChange={handleChange}
                placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Lname">Last Name</Label>
              <Input
                id="Lname"
                name="Lname"
                required
                value={formData.Lname}
                onChange={handleChange}
                placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="doctor@example.com" />
          </div>

          {/* License Upload */}
          <div className="space-y-2">
            <Label>Medical License</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="License preview"
                    className="max-h-48 rounded" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <Label
                    htmlFor="file-upload"
                    className="mt-2 cursor-pointer text-blue-600 hover:text-blue-500"
                  >
                    <span>Upload your medical license</span>
                    <Input
                      id="file-upload"
                      name="file"
                      type="file"
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={handleChange}
                      required />
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          className="w-full"
          type="submit"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Submitting..." : "Submit Request"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          After submission, please wait for admin approval. You will receive further instructions via email.
        </p>
      </CardFooter>
    </Card>
    <SuccessDialog/>
    </>
  );
};

export default RegisterDoctor;
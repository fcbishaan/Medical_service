
import DoctorAvailability from "../models/doctorAvailability.js";

const createAvailability = async (req, res) => {
  try {
    const { doctorId, availableDates, availableTimes, location } = req.body;

    if (!doctorId || !availableDates || !availableTimes || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure availableDates is an array of Date objects
    const formattedDates = availableDates.map(date => new Date(date));

    const newAvailability = new DoctorAvailability({
      doctorId,
      availableDates: formattedDates,
      availableTimes,
      location
    });

    await newAvailability.save();

    res.status(201).json({
      success: true,
      message: "Doctor availability created successfully",
      data: newAvailability
    });
  } catch (error) {
    console.error("Error creating availability:", error);
    res.status(500).json({ message: "Error creating doctor availability" });
  }
};

// Fetch all available slots for a doctor
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availabilitySlots = await DoctorAvailability.find({ doctorId, isBooked: false })
      .sort({ availableDate: 1, availableTime: 1 });

    res.status(200).json({
      success: true,
      message: "Available slots retrieved successfully",
      data: availabilitySlots,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ success: false, message: "Error fetching availability" });
  }
};

export { createAvailability, getDoctorAvailability };

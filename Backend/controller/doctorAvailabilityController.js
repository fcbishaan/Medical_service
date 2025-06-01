import DoctorAvailability from "../models/doctorAvailability.js";
import mongoose from "mongoose";

const createAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { availableDates, availableTimes, location, sessionDuration } = req.body;

    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });
    }
    if (!availableDates?.length || !availableTimes?.length || !location) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const formattedDates = availableDates.map(date => {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new Error("Invalid date format");
      }
      return d;
    });

  
    const slots = [];
    for (const date of formattedDates) {
      for (const time of availableTimes) {
        slots.push({
          doctorId,
          date,
          time,
          location,
          sessionDuration: sessionDuration || 30, // default 30 mins
          isBooked: false
        });
      }
    }

    // Insert all slots at once
    const createdSlots = await DoctorAvailability.insertMany(slots);

    res.status(201).json({
      success: true,
      message: "Availability slots created successfully",
      data: createdSlots
    });
  } catch (error) {
    console.error("Error creating availability:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error creating availability slots" 
    });
  }
};

const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });
    }

    // Get available slots grouped by date
    const availability = await DoctorAvailability.aggregate([
      {
        $match: { 
          doctorId: new mongoose.Types.ObjectId(doctorId), 
          
        }
      },
      { $sort: { date: 1, time: 1 } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          date: { $first: "$date" },
          slots: {
            $push: {
              id: "$_id",
              time: "$time",
              location: "$location",
              sessionDuration: "$sessionDuration",
              isBooked: "$isBooked"
            }
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: "Availability retrieved successfully",
      data: availability
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching availability" 
    });
  }
};

// Add this new function to update availability
const updateAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { isBooked } = req.body;

    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      return res.status(400).json({ success: false, message: "Invalid slot ID" });
    }

    const updatedSlot = await DoctorAvailability.findByIdAndUpdate(
      slotId,
      { isBooked },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
      data: updatedSlot
    });
  } catch (error) {
    console.error("Error updating slot:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating slot" 
    });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      return res.status(400).json({ success: false, message: "Invalid slot ID" });
    }

    const deletedSlot = await DoctorAvailability.findByIdAndDelete(slotId);

    if (!deletedSlot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    res.status(200).json({
      success: true,
      message: "Availability slot deleted successfully",
      data: deletedSlot
    });
  } catch (error) {
    console.error("Error deleting availability:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting availability slot"
    });
  }
};

// Add to doctorAvailability controller

export { createAvailability, getDoctorAvailability, updateAvailability,deleteAvailability };
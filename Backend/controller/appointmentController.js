// controllers/appointmentController.js
import AppoinmentSchema from "../models/AppoinmentSchema.js";
import DoctorAvailability from "../models/doctorAvailability.js";

 const bookAppointment = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { notes } = req.body;
    const patientId = req.user.id;

    // 1. Verify slot exists and is available
    const slot = await DoctorAvailability.findById(slotId);
    if (!slot || slot.isBooked) {
      return res.status(400).json({ 
        success: false,
        message: "Slot not available" 
      });
    }

    // 2. Create appointment
    const appointment = await AppoinmentSchema.create({
      doctor: slot.doctorId,
      patient: patientId,
      slot: slotId,
      date: slot.date,
      time: slot.time,
      notes
    });

    // 3. Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment booked successfully"
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Booking failed" 
    });
  }
};


 const getPatientAppointments = async (req, res) => {
    try {
      const appointments = await AppoinmentSchema.find({ patient: req.user.id })
        .populate({
          path: 'doctor',
          select: 'firstName lastName speciality clinicAddress phone email',
        })
        .populate('slot', 'date time location')
        .sort({ date: -1 });
  
      // Format the response to include fullName
      const formattedAppointments = appointments.map(appointment => ({
        ...appointment._doc,
        doctor: appointment.doctor ? {
          ...appointment.doctor._doc,
          name: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`.trim()
        } : null
      }));

      res.status(200).json({
        success: true,
        data: formattedAppointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch patient appointments"
      });
    }
  };
  
   const getDoctorAppointments = async (req, res) => {
     try {
       const appointments = await AppoinmentSchema.find({ doctor: req.user.id })
         .populate('patient', 'name email phone')
         .populate('slot', 'date time location')
         .sort({ date: -1 });

       res.status(200).json({
         success: true,
         data: appointments
       });
     } catch (error) {
       res.status(500).json({
         success: false,
         message: error.message || "Failed to fetch doctor appointments"
       });
     }
   };
   const updateAppointmentStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['confirmed', 'completed', 'cancelled'];
  
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }
  
      const appointment = await AppoinmentSchema.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('patient doctor', 'name email');
  
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found"
        });
      }
  
      res.status(200).json({
        success: true,
        data: appointment,
        message: "Appointment status updated"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update status"
      });
    }
  };
  const cancelAppointment = async (req, res) => {
    try {
      const appointment = await AppoinmentSchema.findById(req.params.id)
        .populate('slot')
        .populate('doctor', 'name');
  
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found"
        });
      }
  
      // Check if the appointment belongs to the patient
      if (appointment.patient.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to cancel this appointment"
        });
      }
  
      // Check if appointment is already cancelled/completed
      if (appointment.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: "Appointment is already cancelled"
        });
      }
  
      if (appointment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel completed appointment"
        });
      }
  
      // Calculate time difference (24 hours before appointment)
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const currentDateTime = new Date();
      const hoursDifference = (appointmentDateTime - currentDateTime) / (1000 * 60 * 60);
  
      if (hoursDifference < 24) {
        return res.status(400).json({
          success: false,
          message: "Appointments can only be cancelled at least 24 hours in advance"
        });
      }
  
      // Update appointment status
      appointment.status = 'cancelled';
      await appointment.save();
  
      // Mark slot as available again
      if (appointment.slot) {
        await DoctorAvailability.findByIdAndUpdate(
          appointment.slot._id,
          { isBooked: false }
        );
      }
  
      res.status(200).json({
        success: true,
        message: "Appointment cancelled successfully",
        data: appointment
      });
  
    } catch (error) {
      console.error("Cancellation error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to cancel appointment"
      });
    }
  };

  export { 
    bookAppointment, 
    getPatientAppointments, 
    getDoctorAppointments, 
    updateAppointmentStatus,
    cancelAppointment 
  };
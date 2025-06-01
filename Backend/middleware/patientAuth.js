// Middleware to check patient profile


export const checkPatientProfile = async (req, res, next) => {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(403).json({
        success: false,
        message: "Complete patient profile to book appointments"
      });
    }
    next();
  };
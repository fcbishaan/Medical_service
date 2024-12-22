import doctorModel from "../models/doctorModel.js"


const requestToJoin = async (req, res) => {
    const { name, email, license } = req.body;
    if (!name || !email || !license) {
        return res.json({ success: false, message: "Missing Details" });
    }
    try {
        const newRequest = new doctorModel({
            name,
            email,
            license,
            status: "pending"
        });

       
        await newRequest.save({ validateBeforeSave: false });
        res.json({ success: true, message: "Request submitted successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error submitting request." });
    }
};



const completeProlfe = async (req, res) => {
    const{doctorId, speciality, degree, experience, about, fees, address, slots} = req.body;
    if(!doctorId || !speciality || !degree || !experience || !about || !fees || !address || !slots){
        return res.json({ success: false, message: "Missing Details" });
    }
    try {
        const doctor = await doctorModel.findById(doctorId);
        if(!doctor || doctor.status !== 'approved'){
            return res.json({success: false, message: "Doctor not approved or does not exist"})
        }
        doctor.speciality = speciality;
        doctor.degree = degree;
        doctor.experience = experience;
        doctor.about = about;
        doctor.fees = fees;
        doctor.address = JSON.parse(address);
        doctor.slots = JSON.parse(slots);
        doctor.status = "prfoleCompleted";
        await doctor.save();
        res.json({ success: true, message: "Profile completed successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error completing profile." });
    }
}
export { requestToJoin, completeProlfe}
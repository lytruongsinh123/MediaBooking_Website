import db from "../models/index";
import emailService from "../services/emailService";
import _ from "lodash";
require("dotenv").config();
let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.date || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing email parameter",
                });
                return;
            } else {
                
                await emailService.sendSimpleEmail({
                    reciverEmail: data.email,
                    patientName: data.patientName,
                    doctorName: data.doctorName,
                    time: data.time,
                    date: data.date,
                    clinicName: data.clinicName,
                    redirectLink: `https://www.facebook.com/hung.do.105802`,
                });
                // upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: "R3", // Assuming R3 is the role for patients
                    },
                });
                // create a booking record
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: {
                            patientId: user[0].id,
                        },
                        defaults: {
                            statusId: "S1",
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            date: data.date,
                            timeType: data.timeType,
                        },
                    });
                }
                resolve({
                    errCode: 0,
                    errMessage: "Booking successful",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};
module.exports = {
    postBookAppointment: postBookAppointment,
};

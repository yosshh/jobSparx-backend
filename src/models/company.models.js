import mongoose, { Schema } from "mongoose";

const companySchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    website: {
        type: String,
    },
    logo: {
        type: String, // url from clodinary
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

export const Company = mongoose.model("Company", companySchema);
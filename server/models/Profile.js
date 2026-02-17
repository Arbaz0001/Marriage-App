import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // BASIC
    name: String,
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    dob: Date,
    maritalStatus: String,
    profileCreatedBy: String,

    // CONTACT
    mobile: String,
    whatsapp: String,

    // RELIGION (MUSLIM)
    sect: {
      type: String, // Sunni / Shia
    },
    motherTongue: String,

    // LOCATION
    country: {
      type: String,
      default: "India",
    },
    state: String,
    city: String,

    // EDUCATION & WORK
    education: String,
    occupation: String,
    income: String,

    // EXTRA
    age: Number,
    complexion: String,
    caste: String,

    // FAMILY
    fatherOccupation: String,
    motherOccupation: String,
    fatherName: String,
    motherName: String,
    siblings: String,
    familyType: String,

    // LIFESTYLE
    height: String,
    diet: {
      type: String,
      default: "Halal",
    },

    // ABOUT
    about: String,

    // IMAGES
    photos: [
      {
        type: String, // image path
      },
    ],

    // ADMIN CONTROL
    isApproved: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

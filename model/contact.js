import mongoose from "mongoose";

const Contact = mongoose.model("Contact", {
  username: {
    type: String,
    required: true,
  },
  mobilePhone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
});

export default Contact;

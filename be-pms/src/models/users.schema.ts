import mongoose from "mongoose";
import Role from "./roles.schema";
const UserSchema = new mongoose.Schema({
    fullName: {
        type:String,
        require:[true,"Fullname is required"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid email`,
      }
    },
    password: {
      type: String,
      minLength: [8, "Password must have at least 8 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    avatar: String,
    phone: {
      type: String,
      match: [
        /^(?:\+84|0)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/,
        "Invalid phone number",
      ],
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE", "DELETED"],
        message: "Status must be 'ACTIVE', 'INACTIVE', or 'DELETED'.",
      },
      default: "ACTIVE",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Role
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
},{ timestamps: true })

// hashed password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

export default mongoose.model("User", UserSchema);

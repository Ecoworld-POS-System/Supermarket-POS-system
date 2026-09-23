import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    empId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      default: 'admin123',
    },
    role: {
      type: String,
      default: 'Cashier',
    },
    branch: {
      type: String,
      default: 'Colombo – Head Office',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    phone: {
      type: String,
    },
    lastLogin: {
      type: String,
      default: 'Never logged in',
    },
  },
  { 
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || ret.empId;
        ret.empId = ret.empId || ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

userSchema.pre('validate', function (next) {
  if (!this.empId && this.id) {
    this.empId = this.id;
  }
  if (!this.id && this.empId) {
    this.id = this.empId;
  }
  if (!this.password) {
    this.password = 'admin123';
  }
  next();
});

// Pre-save hook to hash password before saving to DB
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(this.password, salt, 64).toString('hex');
    this.password = `${salt}:${hash}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = function (enteredPassword) {
  const [salt, key] = this.password.split(':');
  if (!salt || !key) return false;
  
  const hash = crypto.scryptSync(enteredPassword, salt, 64).toString('hex');
  return hash === key;
};

// Generate Employee ID before validation if not provided (Wait, Employee ID isn't in schema, adding it)
// Ah, the UI relies on an `id` field like 'EMP-001'. Let's map _id or add an empId field.
// Actually, I'll add empId.

const User = mongoose.model('User', userSchema);
export default User;

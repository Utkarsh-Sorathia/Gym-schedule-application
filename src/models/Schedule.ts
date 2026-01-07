import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISet {
    reps: number;
    weight: number;
}

export interface IExercise {
    name: string;
    secondaryName?: string;
    selectedExercise?: 'primary' | 'secondary';
    sets: ISet[];
    weightType?: 'total' | 'per_side'; // 'total' for barbell/machine, 'per_side' for dumbbells
    secondarySets?: ISet[];
    secondaryWeightType?: 'total' | 'per_side';
}

export interface IScheduleData {
    day: string;
    exercises: IExercise[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISchedule extends IScheduleData, Document {}

const SetSchema: Schema = new Schema({
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
});

const ExerciseSchema: Schema = new Schema({
    name: { type: String, required: true },
    secondaryName: { type: String },
    selectedExercise: { type: String, enum: ['primary', 'secondary'], default: 'primary' },
    sets: [SetSchema],
    weightType: { type: String, enum: ['total', 'per_side'], default: 'total' },
    secondarySets: [SetSchema],
    secondaryWeightType: { type: String, enum: ['total', 'per_side'], default: 'total' },
});

const ScheduleSchema: Schema = new Schema({
    day: { type: String, required: true, unique: true }, // Mon, Tue, Wed, etc.
    exercises: [ExerciseSchema],
}, { timestamps: true });

// Prevent Mongoose OverwriteModelError
// Delete the model if it exists to ensure new schema changes are applied (especially in dev)
if (process.env.NODE_ENV === 'development' && mongoose.models.Schedule) {
    delete mongoose.models.Schedule;
}

const Schedule: Model<ISchedule> = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;

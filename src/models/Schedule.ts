import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISet {
    reps: number;
    weight: number;
}

export interface IExercise {
    name: string;
    sets: ISet[];
}

export interface ISchedule extends Document {
    day: string;
    exercises: IExercise[];
    createdAt: Date;
    updatedAt: Date;
}

const SetSchema: Schema = new Schema({
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
});

const ExerciseSchema: Schema = new Schema({
    name: { type: String, required: true },
    sets: [SetSchema],
});

const ScheduleSchema: Schema = new Schema({
    day: { type: String, required: true, unique: true }, // Mon, Tue, Wed, etc.
    exercises: [ExerciseSchema],
}, { timestamps: true });

const Schedule: Model<ISchedule> = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;

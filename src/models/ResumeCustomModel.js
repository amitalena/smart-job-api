const mongoose = require('mongoose')

const CustomResumeSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true
    },
    header: {
        name: { type: String, required: true },
        designation: { type: String },
        contact: {
            email: { type: String, required: true },
            mobile: { type: String, required: true },
            linkedin: { type: String },
            github: { type: String },
        },
    },
    resume: { type: String },
    professionalSummary: { type: String, required: true },
    skills: [String],
    employeement: {
        currentEmployee: {
            currentCompany: { type: String, required: true },
            currentCompanyAddress: { type: String },
            currentDesignation: { type: String, required: true },
            currentCompanyContact: {
                email: { type: String },
                mobile: { type: String },
            },
            previousCompanyDuration: {
                years: { type: Number, required: true },
                months: { type: String, required: true },
            },
        },
        previousEmployment: {
            previousCompany: { type: String },
            previousCompanyAddress: { type: String },
            previousDesignation: { type: String },
            previousCompanyContact: {
                email: { type: String },
                mobile: { type: String },
            },
            previousCompanyDuration: {
                years: { type: Number },
                months: { type: String },
            },
        },
    },
    education: {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        startYear: { type: Date, required: true },
        endYear: { type: Date, required: true },
        grade: { type: String },
    },
    workExperience: {
        title: { type: String, required: true },
        company: { type: String, required: true },
        designation: { type: String, required: true },
        duration: {
            durationYear: { type: Number },
            durationMonth: { type: Number },
        },
    },
    projects: {
        projectName: { type: String, required: true },
        projectDescription: { type: String },
        technologies: [String],
    },
    certifications: [String],
    achievements: [String],
    extracurricularActivities: [String],
    references: {
        referenceName: { type: String },
        referenceContact: { type: String },
        referenceRelation: { type: String },
    },
    accompliment: {
        onlineProfileLink: { type: String },
        workSample: { type: String },
        certificationTitle: { type: String },
    },
    personalDetails: {
        personal: { type: String },
        dob: { type: String },
        categories: { type: String },
        permanentAddress: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const CUSTOMRESUME = mongoose.model('CustomResume', CustomResumeSchema);

module.exports = CUSTOMRESUME;
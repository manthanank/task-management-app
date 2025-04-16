const mongoose = require("mongoose");
const User = require("../models/user.model");
const Organization = require("../models/organization.model");
const connectDB = require("../config/db.config");

async function assignDefaultOrg() {
    try {
        await connectDB();

        // Find the first user to set as owner, or handle if no users exist
        const firstUser = await User.findOne();
        if (!firstUser) {
            console.log("No users found in the database.");
            await mongoose.disconnect();
            return;
        }

        let defaultOrg = await Organization.findOne({ name: "Default Organization" });
        if (!defaultOrg) {
            defaultOrg = await Organization.create({
                name: "Default Organization",
                description: "Migrated users default organization",
                owner: firstUser._id,
                members: [
                    {
                        user: firstUser._id,
                        role: "admin",
                        joinedAt: new Date(),
                    },
                ],
            });
        }

        // Get all users
        const allUsers = await User.find();

        // Update all users to have the default organization
        await User.updateMany(
            {},
            { $set: { organization: defaultOrg._id } }
        );

        // Add all users as members (avoid duplicates)
        const existingMemberIds = defaultOrg.members.map(m => m.user.toString());
        allUsers.forEach(user => {
            if (!existingMemberIds.includes(user._id.toString())) {
                defaultOrg.members.push({
                    user: user._id,
                    role: "member",
                    joinedAt: new Date(),
                });
            }
        });
        await defaultOrg.save();

        console.log("Assigned all users to the default organization.");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error assigning default organizations:", error);
        await mongoose.disconnect();
    }
}

assignDefaultOrg();

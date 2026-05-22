const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./src/models/problem');

const seed = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log('Connected to DB');

        const problemCount = await Problem.countDocuments();
        if (problemCount > 0) {
            console.log('Database already has problems');
            process.exit(0);
        }

        const dummyProblem = {
            title: "Two Sum",
            description: "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>",
            difficulty: "easy",
            tags: ["array"],
            visibleTestCases: [
                { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
            ],
            hiddenTestCases: [
                { input: "[3,2,4], 6", output: "[1,2]" }
            ],
            startCode: [
                { language: "c++", initialCode: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};" }
            ],
            referenceSolution: [
                { language: "c++", completeCode: "#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> m;\n        for(int i=0; i<nums.size(); i++) {\n            if(m.count(target - nums[i])) return {m[target - nums[i]], i};\n            m[nums[i]] = i;\n        }\n        return {};\n    }\n};" }
            ],
            problemCreator: "65f0a1b2c3d4e5f6a7b8c9d0" // Dummy ID
        };

        await Problem.create(dummyProblem);
        console.log('Dummy problem created');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();

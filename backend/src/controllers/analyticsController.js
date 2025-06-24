const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); 

const getTaskOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const totalTasks = await Task.countDocuments({ user: userId });
    const pendingTasks = await Task.countDocuments({ user: userId, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ user: userId, status: 'Working' }); 
    const finishedTasks = await Task.countDocuments({ user: userId, status: 'Finished' }); 

    res.json({
        totalTasks,
        pendingTasks,
        inProgressTasks,
        finishedTasks,
        completed: finishedTasks 
    });
});


const getTaskTrends = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { period = 'last7days', dataType = 'created' } = req.query; 

    let startDate;
    let groupByFormat; 
    let dateUnitsToAdd; 

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    switch (period) {
        case 'last30days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29); 
            groupByFormat = "%Y-%m-%d"; 
            break;
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            groupByFormat = "%Y-%m-%d"; 
            break;
        case 'last7days':
        default: 
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 6); 
            groupByFormat = "%Y-%m-%d"; 
            break;
    }

    let matchStage = {
        user: userId, 
    };
    let dateFieldToConsider;

    if (dataType === 'created') {
        dateFieldToConsider = '$createdAt';
        matchStage.createdAt = { $gte: startDate };
    } else if (dataType === 'completed') {
        dateFieldToConsider = '$updatedAt'; 
        matchStage.status = 'Finished';    
        matchStage.updatedAt = { $gte: startDate };
    } else {
        return res.status(400).json({ message: "Invalid dataType. Use 'created' or 'completed'." });
    }

    try {
        const trends = await Task.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: dateFieldToConsider } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }, 
            {
                $project: { 
                    date: '$_id',
                    count: '$count',
                    _id: 0 
                }
            }
        ]);

        const allDatesInRange = [];
        const trendDataMap = new Map(trends.map(item => [item.date, item.count]));
        let currentDateIter = new Date(startDate);

        while (currentDateIter <= today) {
            const dateString = currentDateIter.toISOString().split('T')[0]; 
            allDatesInRange.push({
                date: dateString,
                label: currentDateIter.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: trendDataMap.get(dateString) || 0
            });
            currentDateIter.setDate(currentDateIter.getDate() + 1);
        }
        
        res.json({
            labels: allDatesInRange.map(item => item.label),
            data: allDatesInRange.map(item => item.count),
            trendType: dataType,
            period: period
        });

    } catch (error) {
        console.error(`Error fetching task ${dataType} trends for period ${period}:`, error);
        next(error);
    }
});

module.exports = {
    getTaskOverview,
    getTaskTrends,
};
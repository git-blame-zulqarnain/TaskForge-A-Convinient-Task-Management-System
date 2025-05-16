const {check,body,validationResult}=require('express-validator');

const validateTask=[
    check('title').trim().notEmpty().withMessage('Required').isString().withMessage('Title must be a string'),
    check('description').optional({checkFalsy: true}).isString().withMessage('Must be a String').trim(),
    check('status').optional().isIn(['Pending','Working','Finished']).withMessage('Invalid: Must be Pending, Working or Finished'),
    check('dueDate').optional({checkFalsy:true}).isISO8601().withMessage('Invalid format: Must be a valid ISO8601 string or YYYY-MM-DD').toDate()

];
module.exports={validateTask};
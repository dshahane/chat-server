import _ from 'lodash';

export default function formatErrors(err, models, path=".") {
    if (err instanceof models.sequelize.ValidationError) {
        const errorList = err.errors.map(validationerrorItem => {
            return _.pick(validationerrorItem, ['path', 'message']);
        });
        //console.log(errorList);
        return errorList;
    }
    return [{'path': path, 'message': 'Something went wrong'}];
}

export function makeError(str, path) {
    return [{'path': path, 'message': str}];    
}

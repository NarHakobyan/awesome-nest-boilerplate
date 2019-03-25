'use strict';

interface IConstraintErrors {
    [constraintKey: string]: string;
}

export const ConstraintErrors: IConstraintErrors = {
    UQ_fe0bb3f6520ee0469504521e710: 'error.unique.username',
    UQ_97672ac88f789774dd47f7c8be3: 'error.unique.email',
};

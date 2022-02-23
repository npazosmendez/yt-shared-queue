import express from 'express';

type ExpressMiddleware = (req : express.Request, res : express.Response, next : express.NextFunction) => void;


export const asyncHandler = (fn : ExpressMiddleware) => function(req : express.Request, res : express.Response, next : express.NextFunction) {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

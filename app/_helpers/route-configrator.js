const router = require("express").Router();
function configRoutes(API_ROUTES) {
    API_ROUTES.forEach((route) => {
        switch (route.method) {
            case "GET":
                router.get(route.path, ...route.handlers)
                break;
            case "POST":
                router.post(route.path, ...route.handlers)
                break;
            case "PUT":
                router.put(route.path, ...route.handlers)
                break;
            case "DELETE":
                router.delete(route.path, ...route.handlers)
                break;
            case "PATCH":
                router.patch(route.path, ...route.handlers)
                break;
            case "ALL":
                router.all(route.path, ...route.handlers)
                break;

        }
    })
    return router
}
module.exports = configRoutes
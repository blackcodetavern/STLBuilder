import Vue from "vue";
import Router from "vue-router";
import Masterpage from "./layouts/Masterpage.vue";
import ManifoldBuilder from "./views/ManifoldBuilder.vue";
import SceneBuilder from "./views/SceneBuilder.vue";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "/",
            component: Masterpage,
            children: [
                {
                    path: "",
                    name: "home",
                    component: ManifoldBuilder
                },
                {
                    path: "/sceneBuilder",
                    name: "home",
                    component: SceneBuilder
                }
            ]
        }
    ]
});

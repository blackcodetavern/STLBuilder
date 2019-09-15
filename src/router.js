import Vue from "vue";
import Router from "vue-router";
import Masterpage from "./layouts/Masterpage.vue";
import Home from "./views/Home.vue";


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
          component: Home
        }
      ]
    }
  ]
});

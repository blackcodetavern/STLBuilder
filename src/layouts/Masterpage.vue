<template>
    <q-layout view="hHh Lpr lff">
        <q-header>
            <q-toolbar>
                <q-btn flat @click.capture="drawerClick" round dense icon="dashboard" />
                <q-toolbar-title>STL Builder</q-toolbar-title>
            </q-toolbar>
        </q-header>
        <q-drawer v-model="drawer" :mini="miniState" bordered content-class="bg-secondary">
            <q-scroll-area class="fit">
                <q-list padding>
                    <q-item clickable v-ripple to="/" class="text-grey-10">
                        <q-item-section avatar>
                            <q-icon name="extension" />
                        </q-item-section>
                        <q-item-section>Benutzer</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple to="/group" class="text-grey-10">
                        <q-item-section avatar>
                            <q-icon name="grid_on" />
                        </q-item-section>
                        <q-item-section>Gruppen</q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </q-drawer>
        <q-page-container>
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script>
export default {
    name: "Masterpage",

    data() {
        return {
            drawer: true,
            miniState: true
        };
    },
    methods: {
        drawerClick(e) {
            //this.miniState = !this.miniState;
            e.stopPropagation();
        }
    }
};
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
         <q-icon name="dashboard" size="25px"/>
        <q-toolbar-title>
          STL Builder
        </q-toolbar-title>

      </q-toolbar>
    </q-header>
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
    };
  }
};
</script>

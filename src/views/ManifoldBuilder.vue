<template>
    <div class="row">
        <div class="col-4">
            <div class="row">
                <div class="col-8 q-pa-sm">
                    <q-select
                        option-value="id"
                        option-label="name"
                        emit-value
                        filled
                        map-options
                        v-model="selected"
                        :options="manifolds"
                        label="Manifold"
                        dense
                    />
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <q-btn @click="newManifold" color="primary" style="width:100%">New</q-btn>
                </div>
                <div class="text-subtitle2 q-pa-sm col-12">Name</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="selectedManifold.name"
                        label="Name"
                        dense
                    />
                </div>
                <div class="text-subtitle2 q-pa-sm col-12">Parameters</div>
                <div
                    class="col-6 q-pa-sm"
                    v-for="parameter in selectedManifold.parameters"
                    v-bind:key="parameter.id"
                >
                    <q-input
                        filled
                        square
                        stack-label
                        v-model="parameter.value"
                        :label="parameter.name"
                        dense
                    />
                </div>

                <div class="text-subtitle2 q-pa-sm col-12">Inner Wall</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        style="font-family:monospace"
                        filled
                        square
                        stack-label
                        type="textarea"
                        v-model="selectedManifold.innerWallDefinition"
                        dense
                    />
                </div>

                <div class="text-subtitle2 q-pa-sm">Outer Wall</div>
                <div class="col-12 q-pa-sm">
                    <q-input
                        style="font-family:monospace"
                        filled
                        square
                        stack-label
                        v-model="selectedManifold.outerWallDefinition"
                        type="textarea"
                        dense
                    />
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center">
                    <q-btn @click="updateView" color="primary" style="width:100%">Update</q-btn>
                </div>
                <div class="col-4 q-pa-sm" style="text-align:center;padding-top:15px">
                    <a
                        style="width:100%"
                        :href="'data:application/octet-stream,' + encodeURIComponent(downloadString)"
                        download="generated.stl"
                    >Download</a>
                </div>
            </div>
        </div>
        <div class="col-8 q-pa-sm">
            <canvas id="canv" style="width:100%;height:600px"></canvas>
        </div>
    </div>
</template>

<style>
</style>

<script>
import simple3dloader from "./../3d/simple3dloader";
import manifoldmanager from "./../3d/manifoldmanager";
export default {
    name: "ManifoldBuilder",
    data() {
        return {
            manifolds: manifoldmanager.getAllManifolds(),
            downloadString: "",
            parametersBasic: [
                { id: "hS", name: "# Horizontal steps", value: 10 },
                { id: "vS", name: "# Vertical steps", value: 10 }
            ],
            selectedInner: 0
        };
    },
    methods: {
        newManifold() {
            var newManifold = {
                name: "NewManifold",
                id: this.manifolds.length + 1,
                outerWallDefinition: ``,
                innerWallDefinition: ``,
                parameters: [{ id: "hS", value: 10 }, { id: "vS", value: 10 }]
            };
            this.manifolds.push(newManifold);
        },
        updateView: function() {
            this.saveManifold();
            var loader = new simple3dloader();
            var canvas = document.getElementById("canv");
            loader.init(canvas);
            this.downloadString = manifoldmanager.createManifold([
                manifoldmanager.createManifoldPart(this.selectedInner)
            ]);
            loader.setMesh(this.downloadString);
        },
        saveManifold() {
            var realManifold = this.manifolds.find(
                x => x.id == this.selectedInner
            );
            var selectedManifold = this.selectedManifold;
            for (var param in selectedManifold) {
                realManifold[param] = JSON.parse(
                    JSON.stringify(selectedManifold[param])
                );
            }
            localStorage.setItem("manifolds", JSON.stringify(this.manifolds));
        }
    },
    computed: {
        selected: {
            get() {
                return this.selectedInner;
            },
            set(selection) {
                this.selectedInner = selection;
                this.updateView();
            }
        },
        selectedManifold: {
            get() {
                return JSON.parse(
                    JSON.stringify(
                        this.manifolds.find(x => x.id == this.selectedInner)
                    )
                );
            }
        }
    },
    mounted() {
        this.updateView();
    }
};
</script>

<template>
    <div class="row">
        <div class="col-4">SCENE</div>
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
    name: "SceneBuilder",
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

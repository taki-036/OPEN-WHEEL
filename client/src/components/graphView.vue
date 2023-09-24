/*
 * Copyright (c) Center for Computational Science, RIKEN All rights reserved.
 * Copyright (c) Research Institute for Information Technology(RIIT), Kyushu University. All rights reserved.
 * See License in the project root for the license information.
 */
<template>
  <div
    @dragover.prevent
    @dragenter.prevent
  >
    <component-graph
      @componentRightClick=onComponentRightClick
      @connectorRightClick=onConnectorRightClick
      @vconnectorRightClick=onVconnectorRightClick
    />
    <v-menu
      :v-model=openComponentContextMenu
      activator="parent"
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in componentContextMenuItems"
          :key="index"
          :value=index
        >
          <v-list-item-title> {{ item.text }} </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { mapMutations} from "vuex";
import ComponentGraph from "@/components/componentGraph/componentGraph.vue"
import { widthComponentLibrary, heightToolbar, heightDenseToolbar, heightFooter } from "@/lib/componentSizes.json";

export default {
  name: "GraphView",
  components: {
    ComponentGraph
  },
  mounted: function () {
    this.fit();
    window.addEventListener("resize", this.fit.bind(this));
  },
  beforeDestroy: function () {
    window.removeEventListener("resize", this.fit.bind(this));
  },
  data(){
    return {
      openComponentContextMenu:false,
      menuX:0,
      menuY:0,
      componentContextMenuItems:{
        text: "delete",
        cb: this.deleteComponent
      }
    }
  },
  methods: {
    test(e){
      console.log("DEBUG",e);
    },
    ...mapMutations(
      {
        commitCanvasWidth: "canvasWidth",
        commitCanvasHeight: "canvasHeight",
      }),
    onComponentRightClick({event, component}){
      console.log("component right clicked", event,component);
      this.menuX=event.screenX;
      this.menuY=event.screenY;
      this.openComponentContextMenu=true;
    },
    onConnectorRightClick({event, item}){
      console.log("connector right clicked", event, item);
    },
    onVconnectorRightClick({event, item}){
      console.log("vconnector right clicked", event, item);
    },
    fit: function () {
      const magicNumberH = 17 +25;
      const magicNumberW = 24;
      const baseWidth = window.innerWidth < this.$parent.$parent.$el.clientWidth ? window.innerWidth : this.$parent.$parent.$el.clientWidth;
      const width = baseWidth - widthComponentLibrary - magicNumberW;
      const height = window.innerHeight - heightToolbar - heightDenseToolbar * 2 - heightFooter - magicNumberH;

      if (width > 0 && height > 0) {
        this.commitCanvasWidth(width);
        this.commitCanvasHeight(height);
      }
    },
  },
};
</script>

<template>
  <g >
    <rect :x=x :y=y @click.stop="$emit('delete')" 
      :width=width :height=height fill=white :stroke-width=12 stroke="transparent" />
    <text :x=x :y=y+height/2 fill=black :text-anchor="start" > delete </text>
  </g>
</template>
<script>
"use strict";

import { boxWidth, textHeight } from "@/lib/constants.json"
export default{
  name:"component-context-menu",
  props:{
    x:{
      required:true,
      type: Number
    },
    y:{
      required:true,
      type: Number
    }
  },
  data(){
    return {
      width: boxWidth*0.5,
      height: textHeight
    }
  },
  mounted(){
    console.log("DEBUG", this.x, this.y);
  }
}
</script>


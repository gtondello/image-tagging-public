<template>
<div>
  <p class="heading">
    {{ heading }}
  </p>
  <p class="question hidden-md-and-up" v-for="item in questions" :key="item.number">
    <!-- This is the layout for small devices -->
    {{ item.question }}<br>
    <v-radio-group v-model="values[item.number-1]" column v-on:change="$emit('input', values)">
      <v-radio v-for="(o, v) in options" :key="o" :label="o" :value="v+1"></v-radio>
    </v-radio-group>
  </p>
  <table class="question hidden-sm-and-down">
    <!-- And this is the layout for large devices -->
    <thead>
      <th></th>
      <th v-for="o in options" :key="o" style="width:10%">{{ o }}</th>
    </thead>
    <tbody>
      <tr v-for="item in questions" :key="item.number">
        <td>{{ item.question }}</td>
        <td v-for="(o, v) in options" :key="o">
          <v-icon :class="values[item.number-1] === v+1 ? 'accent--text' : ''" @click="setItem(values, item.number-1, v+1)">
            {{ values[item.number-1] === v+1 ? 'radio_button_checked' : 'radio_button_unchecked' }}
          </v-icon>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script>
import Vue from 'vue'
import Util from '../services/Util'
export default {
  name: 'LikertScale',
  props: {
    scale: Object,
    value: Array // Initial value received from parent
  },
  data: function () {
    return {
      heading: this.scale.heading,
      questions: Util.shuffle(this.scale.questions.slice(0)), // show questions in randomized order,
      options: this.scale.options,
      values: this.value // Value updated by the user
    }
  },
  methods: {
    setItem (items, index, value) {
      Vue.set(items, index, value)
      this.$emit('input', items)
    }
  }
}
</script>

<style scoped>
p.heading {
  font-size: 16px;
  font-weight: bold;  
}
p.question {
  font-size: 16px;
  text-align: left;
}
table.question {
  width: 100%;
}
table.question th, table.question td {
  text-align: center;
  font-weight: normal;
}
table.question td:first-child {
  text-align: left;
  padding: 5px 10px 5px 0;
}
</style>
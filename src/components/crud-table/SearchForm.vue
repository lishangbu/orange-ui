<template>
  <div class="flex items-end gap-3">
    <div class="flex-1">
      <BasicForm ref="formRef" v-model="internalModel" :formOptions="formOptions" >
        <template #suffix>
          <n-grid-item suffix>
            <n-button @click="onReset" ghost>{{ resetText }}</n-button>
            <n-button type="primary" @click="onSearch">{{ searchText }}</n-button>
          </n-grid-item>
        </template>
      </BasicForm>
    </div>
  </div>
</template>

<script lang="ts">
import { NButton,NGridItem } from 'naive-ui'
import { defineComponent, reactive, toRefs, watch, ref } from 'vue'

import BasicForm from './BasicForm.vue'

import type { FormOptions } from './types'

export default defineComponent({
  name: 'SearchForm',
  components: { BasicForm, NButton,NGridItem },
  props: {
    modelValue: {
      type: Object as () => Record<string, unknown>,
      default: () => ({})
    },
    formOptions: {
      type: Object as () => FormOptions,
      required: true
    },
    resetText: {
      type: String,
      default: '重置'
    },
    searchText: {
      type: String,
      default: '查询'
    }
  },
  emits: ['update:modelValue', 'search', 'reset'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const internalModel = reactive<Record<string, unknown>>({ ...(modelValue.value || {}) })
    const formRef = ref<any>()

    // sync parent -> internal
    watch(modelValue, (v) => {
      Object.keys(internalModel).forEach((k) => delete internalModel[k])
      if (v && typeof v === 'object') {
        Object.keys(v).forEach((k) => {
          internalModel[k] = (v as Record<string, unknown>)[k]
        })
      }
    }, { deep: true })

    // sync internal -> parent
    watch(internalModel, (v) => {
      emit('update:modelValue', { ...internalModel })
    }, { deep: true })

    function onSearch() {
      emit('search', { ...internalModel })
    }

    function onReset() {
      // clear internalModel
      Object.keys(internalModel).forEach((k) => delete internalModel[k])
      emit('update:modelValue', {})
      emit('reset')
      // optional: reset underlying form ref if available
      if (formRef.value && typeof formRef.value.resetForm === 'function') {
        formRef.value.resetForm()
      }
    }

    return {
      internalModel,
      formRef,
      onSearch,
      onReset
    }
  }
})
</script>

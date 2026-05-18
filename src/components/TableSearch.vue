<template>
  <el-form ref="ruleFormRef" :model="formData" :rules="rules">
    <el-row :gutter="24">
      <template v-for="item in formItemAttrs" :key="item.prop">
        <el-col v-bind="item.col">
          <el-form-item :label="item.label" :prop="item.prop">
            <component v-model="formData[item.prop]" :is="getComponent(item.comp)" :placeholder="item.placeholder">
              <template v-if="item.comp === 'select'">
                <el-option label="全部" value="" />
                <el-option v-for="option in item.options" :key="option.value" :label="option.label"
                  :value="option.value" />
              </template>
            </component>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
    <el-row>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="info" @click="handleReset(ruleFormRef)">重置</el-button>
    </el-row>
  </el-form>
</template>
<script setup>
  import { ref, reactive, computed } from 'vue'

  const ruleFormRef = ref()

  const formData = reactive({})

  const props = defineProps({
    formItem: {
      type: Array,
      default: () => [],
    },
  })

  const formItemAttrs = computed(() => {
    return props.formItem.map(item => ({
      ...item,
      col: { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 }
    }))
  })

  const getComponent = (comp) => {
    const map = {
      input: 'ElInput',
      select: 'ElSelect',
      date: 'ElDatePicker'
    }
    return map[comp] || 'ElInput'
  }

  const emit = defineEmits(['search'])

  const handleSearch = () => {
    emit('search', formData)
  }
  const handleReset = (formEl) => {
    if (!formEl) return
    formEl.resetFields()
    handleSearch()
  }

</script>
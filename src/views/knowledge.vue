<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSeach" />
  </div>
</template>
<script setup>
  import { ref, onMounted } from 'vue'
  import { getCategoryAPI } from '@/api/admin'
  import PageHead from '@/components/PageHead.vue'
  import TableSearch from '@/components/TableSearch.vue'

  const formItem = ref([
    {
      comp: 'input',
      label: '文章标题',
      prop: 'title',
      placeholder: '请输入文章标题',
    },
    {
      comp: 'select',
      prop: 'category',
      label: '文章分类',
      placeholder: '请选择文章分类',
      options: []
    },
    {
      comp: 'select', prop: 'status', label: '状态', placeholder: '请选择文章状态', options: [
        { label: '草稿', value: '0' },
        { label: '已发布', value: '1' },
        { label: '已下线', value: '2' }
      ]
    }
  ])

  onMounted(async () => {
    const { data: { data } } = await getCategoryAPI()
    formItem.value[1].options = data.map(item => ({
      label: item.categoryName,
      value: item.id
    }))
  })
  const handleSeach = (data) => {
    console.log(data)
  }

</script>

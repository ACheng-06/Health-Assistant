<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button @click="handleAdd" type="primary">新增</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" style="width: 100%; margin-top: 25px">
      <el-table-column prop="title" label="文章标题" width="200" fixed="left">
        <template #default="scope">
          <div style="display: flex; align-items: center;">
            <el-icon>
              <timer />
            </el-icon>
            <span>{{ scope.row.title }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="分类" width="200">
        <template #default="scope">
          <span>{{ categoryMap[scope.row.categoryId] || '未分类' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="authorName" label="作者" width="150" />
      <el-table-column prop="readCount" label="阅读量" width="150" />
      <el-table-column prop="updatedAt" label="发布时间" width="150" />

      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button @click="handleEdit(scope.row)" text type="primary">编辑</el-button>
          <el-button @click="handlePublish(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 2" text
            type="success">发布</el-button>
          <el-button @click="handleUnpublish(scope.row)" v-if="scope.row.status === 1" text
            type="warning">下线</el-button>

          <el-button @click="handleDelete(scope.row)" text type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination style="margin-top: 25px;" :current-page="pagination.currentPage" :page-size="pagination.size"
      layout="prev, pager, next" :total="pagination.total" @current-change="handleChange" />
    <ArticleDialog v-model="dialogVisible" :categories="categories" @success="handleSuccess" />
  </div>
</template>
<script setup>
  import { ref, onMounted, reactive } from 'vue'
  import { getCategoryAPI, getArticlePageAPI } from '@/api/admin'
  import PageHead from '@/components/PageHead.vue'
  import TableSearch from '@/components/TableSearch.vue'
  import ArticleDialog from '@/components/ArticleDialog.vue'

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

  const tableData = ref([])
  const categoryMap = ref({})
  const categories = ref([])
  const dialogVisible = ref(false)

  const pagination = reactive({
    total: 0,
    size: 10,
    currentPage: 1
  })

  const handleAdd = () => {
    dialogVisible.value = true
  }

  onMounted(async () => {
    const data = await getCategoryAPI()
    categories.value = data.map(item => ({
      label: item.categoryName,
      value: item.id
    }))
    formItem.value[1].options = categories.value
    categoryMap.value = formItem.value[1].options.reduce((map, item) => {
      map[item.value] = item.label
      return map
    }, {})
    handleSearch({})
  })

  const handleSearch = async (formData) => {
    const params = {
      ...pagination,
      ...formData
    }
    try {
      const data = await getArticlePageAPI(params)
      tableData.value = data.records || []
      pagination.total = data.total || 0
    } catch (error) {
      console.error('获取列表失败:', error)
    }
  }

  const handleChange = (page) => {
    pagination.currentPage = page
    handleSearch({})
  }

  const handleSuccess = () => {
    pagination.currentPage = 1
    handleSearch({})
  }

</script>

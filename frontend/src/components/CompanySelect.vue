<template>
  <el-select
    v-model="innerValue"
    placeholder="选择企业"
    :clearable="clearable"
    :style="{ minWidth: minWidth }"
    @change="onChange"
  >
    <el-option
      v-for="company in companies"
      :key="company.id"
      :label="company.name"
      :value="String(company.id)"
    />
  </el-select>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getCompanyList } from '@/api/company';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  clearable: {
    type: Boolean,
    default: false
  },
  minWidth: {
    type: String,
    default: '200px'
  },
  statusFilter: {
    type: String,
    default: 'approved'
  },
  autoSelectFirst: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const companies = ref([]);
const innerValue = ref(String(props.modelValue || ''));

const loadCompanies = async () => {
  try {
    const resp = await getCompanyList({ status: props.statusFilter });
    companies.value = resp.data || [];
    if (props.autoSelectFirst && companies.value.length > 0 && !innerValue.value) {
      innerValue.value = String(companies.value[0].id);
      emit('update:modelValue', innerValue.value);
      emit('change', innerValue.value);
    }
  } catch (e) {
    
  }
};

const onChange = (val) => {
  emit('update:modelValue', val);
  emit('change', val);
};

watch(
  () => props.modelValue,
  (nv) => {
    innerValue.value = String(nv || '');
  }
);

onMounted(() => {
  loadCompanies();
});
</script>

<style scoped>
</style>

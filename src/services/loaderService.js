import { ref } from 'vue';

export const loading = ref(null);

export function showLoader(container, onCancel) {
  loading.value = {
    show: true,
    container,
    onCancel,
  };
}

export function hideLoader() {
  loading.value = null;
}

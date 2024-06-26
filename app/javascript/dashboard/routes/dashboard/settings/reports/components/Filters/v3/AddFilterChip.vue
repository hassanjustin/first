<script setup>
import FilterButton from './FilterButton.vue';
import FilterListDropdown from './FilterListDropdown.vue';
import FilterListItemButton from './FilterListItemButton.vue';
import FilterDropdownEmptyState from './FilterDropdownEmptyState.vue';

import { ref } from 'vue';

defineProps({
  name: {
    type: String,
    required: true,
  },
  menuOption: {
    type: Array,
    default: () => [],
  },
  showMenu: {
    type: Boolean,
    default: false,
  },
  placeholderI18nKey: {
    type: String,
    default: '',
  },
  enableSearch: {
    type: Boolean,
    default: true,
  },
  emptyStateMessage: {
    type: String,
    default: '',
  },
});

const hoveredItemId = ref(null);

const showSubMenu = id => {
  hoveredItemId.value = id;
};

const hideSubMenu = () => {
  hoveredItemId.value = null;
};

const isHovered = id => hoveredItemId.value === id;

const emit = defineEmits(['toggleDropdown', 'addFilter', 'closeDropdown']);
const toggleDropdown = () => emit('toggleDropdown');
const addFilter = item => {
  emit('addFilter', item);
  hideSubMenu();
};
const closeDropdown = () => {
  hideSubMenu();
  emit('closeDropdown');
};
</script>

<template>
  <filter-button :button-text="name" left-icon="filter" @click="toggleDropdown">
    <!-- Dropdown with search and sub-dropdown -->
    <template v-if="showMenu" #dropdown>
      <filter-list-dropdown
        v-on-clickaway="closeDropdown"
        class="left-0 md:right-0 top-10"
      >
        <template #listItem>
          <filter-dropdown-empty-state
            v-if="!menuOption.length"
            :message="emptyStateMessage"
          />
          <filter-list-item-button
            v-for="item in menuOption"
            :key="item.id"
            :button-text="item.name"
            @mouseenter="showSubMenu(item.id)"
            @mouseleave="hideSubMenu"
            @focus="showSubMenu(item.id)"
          >
            <!-- Submenu with search and clear button  -->
            <template v-if="item.options && isHovered(item.id)" #dropdown>
              <filter-list-dropdown
                :list-items="item.options"
                :input-placeholder="
                  $t(`${placeholderI18nKey}.${item.type.toUpperCase()}`)
                "
                :enable-search="enableSearch"
                class="flex flex-col w-[216px] overflow-y-auto top-0 left-36"
                @click="addFilter"
              />
            </template>
          </filter-list-item-button>
        </template>
      </filter-list-dropdown>
    </template>
  </filter-button>
</template>

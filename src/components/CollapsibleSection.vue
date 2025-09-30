<template>
    <div class="collapsible">
        <button :id="headerId" :aria-expanded="isExpanded" :aria-controls="contentId" @click="toggle"
            @keydown.enter="toggle" @keydown.space.prevent="toggle" class="collapsible-header" type="button">
            <div class="collapsible-trigger">
                <span>{{ title }}</span>
                <svg :class="['collapsible-icon', { expanded: isExpanded }]" viewBox="0 0 20 20" fill="currentColor"
                    style="width: 16px; height: 16px;" aria-hidden="true">
                    <path fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
            </div>
        </button>
        <div :id="contentId" :aria-labelledby="headerId"
            :class="['collapsible-content', { collapsed: !isExpanded, expanded: isExpanded }]" :style="contentStyle"
            ref="contentEl">
            <div class="collapsible-body" ref="bodyEl">
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, watch } from 'vue'

export default {
    name: 'CollapsibleSection',
    props: {
        title: {
            type: String,
            required: true
        },
        expanded: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            default: () => `collapsible-${Math.random().toString(36).substr(2, 9)}`
        }
    },
    emits: ['toggle'],
    setup(props, { emit }) {
        const isExpanded = ref(props.expanded)
        const contentEl = ref(null)
        const bodyEl = ref(null)
        const contentHeight = ref(0)

        const headerId = computed(() => `${props.id}-header`)
        const contentId = computed(() => `${props.id}-content`)

        const contentStyle = computed(() => {
            if (isExpanded.value) {
                return {
                    maxHeight: `${contentHeight.value}px`
                }
            }
            return {
                maxHeight: '0px'
            }
        })

        const updateHeight = async () => {
            await nextTick()
            if (bodyEl.value) {
                contentHeight.value = bodyEl.value.scrollHeight
            }
        }

        const toggle = () => {
            isExpanded.value = !isExpanded.value
            emit('toggle', isExpanded.value)
        }

        // Update height when content changes or expands
        watch(isExpanded, updateHeight)
        onMounted(updateHeight)

        // Expose updateHeight for external use (e.g., when content changes)
        return {
            isExpanded,
            contentEl,
            bodyEl,
            contentStyle,
            headerId,
            contentId,
            toggle,
            updateHeight
        }
    }
}
</script>

<style scoped>
/* Component styles are in components.css */
</style>
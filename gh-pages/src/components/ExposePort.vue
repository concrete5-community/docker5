<script setup lang="ts">
import type { DockerPort } from "../Ports";

defineProps<{
  port: DockerPort,
}>();

</script>

<template>
  <div class="col-12 col-md-6 col-xl-3">
    <div class="input-group input-group-sm">
      <div class="input-group-text" style="min-width: 150px;">
        <div class="form-check form-switch" :title="`Guest port: ${port.guest}`">
          <input class="form-check-input" type="checkbox" role="switch" :id="`d5-expostport-${port.guest}`" v-model="port.expose" />
          <label class="form-check-label" :for="`d5-expostport-${port.guest}`">{{ port.name }}</label>
        </div>
      </div>
      <input type="number" class="form-control" min="1" max="65535" v-model="port.host" :disabled="!port.expose" />
    </div>
  </div>
</template>

<template>
  <header class="bg-primary sticky-md-top">
    <div class="container py-2">
      <h1><a class="text-white text-decoration-none" href="https://github.com/concrete5-community/docker5">docker5</a></h1>
    </div>
  </header>
  <main class="container">
    <fieldset>
      <legend>Concrete version</legend>
      <div class="row">
        <div class="col-12 col-md-4">
          <label for="image-kind" class="form-label">Stability</label>
            <select id="image-kind" class="form-control" v-model="imageKind">
              <option :value="IMAGE_KINDS.STABLE">Stable Versions</option>
              <option :value="IMAGE_KINDS.DEVELOP">Development Versions</option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label for="version-display-name" class="form-label">Version</label>
          <select id="version-display-name" class="form-control" v-model="versionDisplayName" :disabled="versionDisplayNames.length === 0">
            <option value="" v-if="versionDisplayName === ''"></option>
            <option v-for="i in versionDisplayNames" :value="i">{{ i }}</option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label for="starting-point" class="form-label">Starting Point</label>
          <select id="starting-point" class="form-control" v-model="startingPoint" :disabled="startingPoints.length === 0">
            <option value="" v-if="startingPoint === ''"></option>
            <option v-for="i in startingPoints" :value="i">{{ STARTING_POINT_DISPLAYNAMES.hasOwnProperty(i) ? (<any>STARTING_POINT_DISPLAYNAMES)[i] : i }}</option>
          </select>
        </div>
      </div>
      <div class="row mt-1" v-bind:style="{visibility: matchedActualImage ? 'visible' : 'hidden'}">
        <div class="small text-muted text-end">
            Defaults:
            PHP: {{ matchedActualImage?.defaultPhpVersion }}
            -
            Composer: {{ matchedActualImage?.defaultComposerVersion }}
            -
            PHPUnit: {{ matchedActualImage?.defaultPHPUnitVersion }}
            <span v-if="(<any>matchedActualImage)?.repo && (<any>matchedActualImage)?.branch">
              - Branch: <a target="_blank" :href="`https://github.com/${(<any>matchedActualImage)?.repo}/tree/${(<any>matchedActualImage)?.branch}`">{{ (<any>matchedActualImage)?.branch }}</a>
            </span>
        </div>
      </div>
    </fieldset>

    <fieldset class="mt-4">
      <legend>Exposed ports</legend>
      <div class="row">
        <ExposePort v-for="p in openPorts" :port="p" />
      </div>
    </fieldset>

    <fieldset class="mt-4">
      <legend>Mapped folders</legend>
      <div class="row">
        <table class="table table-sm table-striped table-hover">
          <colgroup>
            <col>
            <col>
            <col style="width: 50%" />
            <col style="width: 50%" />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Host (physical PC)</th>
              <th>Guest (Docker container)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mf, i) in mappedFolders">
              <td class="text-center">
                #{{ i + 1 }}
              </td>
              <td class="text-center">
                <button type="button" class="btn btn-sm btn-light" @click.prevent="mappedFolders.splice(i, 1)">&#x274C;</button>
              </td>
              <td><input type="text" v-model.trim="mf.host" @paste="autoFillGuestMappedFolder(mf)" class="form-control form-control-sm" /></td>
              <td><input type="text" v-model.trim="mf.guest" class="form-control form-control-sm" /></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td><button type="button" class="btn btn-sm btn-light" @click.prevent="mappedFolders.push({host: '', guest: ''})">&#x2795;</button></td>
              <td></td>
              <td class="small ps-2 align-top">
                For packages: <code>/app/packages/package_handle</code>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </fieldset>

    <fieldset class="mt-4">
      <legend>Result</legend>
      <div class="alert mt-3" :class="`alert-${resultLine.messageClass}`" v-if="resultLine.messageClass" style="white-space: pre-wrap;">{{ resultLine.result }}</div>
      <template v-else>
        <div class="d5-result">
          <button type="button" class="d5-copy btn btn-sm btn-secondary" @click.prevent="copyResult()" title="Copy to clipboard" ref="d5_copy">&#x1F4CB;</button>
          <textarea readonly class="form-control code" style="font-family: var(--bs-font-monospace)" rows="3">{{ resultLine.result }}</textarea>
        </div>
        <div v-if="getPortByGuest(80)?.expose" class="small">
          Open <a target="_blank" :href="`http://localhost:${getPortByGuest(80)?.host}`">http://localhost:{{ getPortByGuest(80)?.host }}</a> in your browser to visit the website.
        </div>
        <div v-if="getPortByGuest(8025)?.expose" class="small">
          Open <a target="_blank" :href="`http://localhost:${getPortByGuest(8025)?.host}`">http://localhost:{{ getPortByGuest(8025)?.host }}</a> in your browser to read the emails (run <code>ccm-service start mail</code> in Docker).
        </div>
      </template>
    </fieldset>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {stableImages, developImages, type StableImageInfoAlias, type StableImageInfoActual, type DevelopImageInfoActual, type DevelopImageInfoAlias, type ImageInfoActual } from './Matrix';
import type { DockerPort } from './Ports';
import ExposePort from './components/ExposePort.vue';

enum LSKEYS {
  IMAGE_KIND = 'docker5-imageKind',
  VERSION_DISPLAY_NAME = 'docker5-versionDisplayName',
  STARTING_POINT = 'docker5-startingPoint',
  OPEN_PORTS = 'docker5-openPorts',
  MAPPED_FOLDERS = 'docker5-mappedFolders',
};

enum IMAGE_KINDS {
  STABLE = 'stable',
  DEVELOP = 'develop',
};

const STARTING_POINT_DISPLAYNAMES = {
  atomik_blank: 'Atomik (empty site)',
  atomik_full: 'Atomik (sample site content)',
  elemental_blank: 'Elemental (empty site)',
  elemental_full: 'Elemental (sample site content)',
}

const imageKind = ref<IMAGE_KINDS>(IMAGE_KINDS.STABLE);
const versionDisplayName = ref<string>('');
const startingPoint = ref<string>('');

const imageList = computed<(StableImageInfoActual|StableImageInfoAlias)[]|(DevelopImageInfoActual|DevelopImageInfoAlias)[]>(() => {
  switch (imageKind.value) {
    case IMAGE_KINDS.STABLE:
      return stableImages;
    case IMAGE_KINDS.DEVELOP:
      return developImages;
    default:
      return [];
  }
});

const versionDisplayNames = computed<string[]>(() => {
  if (imageList.value.length === 0) {
    return [];
  }
  const result: string[] = [];
  imageList.value.forEach((image) => {
    if (!result.includes(image.displayName)) {
      result.push(image.displayName);
    }
  })
  return result;
});

const startingPoints = computed<string[]>(() => {
  if (versionDisplayName.value === '' || imageList.value.length === 0) {
    return [];
  }
  const result: string[] = [];
  imageList.value.forEach((image) => {
    if (image.displayName !== versionDisplayName.value)  {
      return;
    }
    const actual = <ImageInfoActual>((<any>image).currently ? (<any>image).currently : image);
    if (!result.includes(actual.startingPoint)) {
      result.push(actual.startingPoint);
    }
  });
  return result;
});

const matchedImage = computed<(StableImageInfoActual|StableImageInfoAlias|DevelopImageInfoActual|DevelopImageInfoAlias|null)>(() => {
  if (versionDisplayName.value === '' || startingPoint.value === '' || imageList.value.length === 0) {
    return null;
  }
  const found: (StableImageInfoActual|StableImageInfoAlias|DevelopImageInfoActual|DevelopImageInfoAlias)[] = [];
  imageList.value.forEach((image) => {
    if (image.displayName !== versionDisplayName.value)  {
      return;
    }
    const actual = <ImageInfoActual>((<any>image).currently ? (<any>image).currently : image);
    if (actual.startingPoint === startingPoint.value) {
      found.push(image);
    }
  });
  return found.length === 1 ? found[0] : null;
});

const matchedActualImage = computed<(StableImageInfoActual|DevelopImageInfoActual|null)>(() => {
  if (!matchedImage.value) {
    return null;
  }
  return (<any>matchedImage.value).currently ? (<any>matchedImage.value).currently : matchedImage.value;
});

const openPorts = ref(<DockerPort[]>[
  {
    name: 'HTTP',
    expose: true,
    guest: 80,
    host: 8080,
  },
  {
    name: 'Database',
    expose: false,
    guest: 3306,
    host: 23306,
  },
  {
    name: 'Mail',
    expose: false,
    guest: 8025,
    host: 8025,
  },
  {
    name: 'Xdebug',
    expose: false,
    guest: 9000,
    host: 29000,
  },
]);

function getPortByGuest(guest: number): DockerPort|null {
  return openPorts.value.find((port) => port.guest === guest) ?? null;
}

interface MappedFolder
{
  host: string,
  guest: string,
}

const mappedFolders = ref<MappedFolder[]>([]);

watch(mappedFolders, () => {
  const serialized: any[] = [];
  mappedFolders.value.forEach((mf) => {
    if (mf.host !== '' || mf.guest !== '') {
      serialized.push({
        host: mf.host,
        guest: mf.guest,
      });
    }
  });
  if (serialized.length === 0) {
    window.localStorage.removeItem(LSKEYS.MAPPED_FOLDERS);
  } else {
    window.localStorage.setItem(LSKEYS.MAPPED_FOLDERS, JSON.stringify(serialized));
  }
}, { deep: true });

interface ResultLine {
  messageClass: string,
  result: string,
}
const resultLine = computed<ResultLine>(() => {
  try {
    if (imageList.value.length === 0) {
      return {messageClass: 'info', result: 'Please select the stability'};
    }
    if (versionDisplayName.value === '') {
      return {messageClass: 'info', result: 'Please select the version'};
    }
    if (startingPoint.value === '') {
      return {messageClass: 'info', result: 'Please select the starting point'};
    }
    if (!matchedImage.value) {
      throw new Error('No matching image found');
    }
    let command = 'docker run --rm -it';
    const alreadyPorts: number[] = [];
    openPorts.value.forEach((port) => {
      if (!port.expose) {
        return;
      }
      if (alreadyPorts.includes(port.host)) {
        throw new Error(`Port ${port.host} is used more than once`);
      }
      alreadyPorts.push(port.host);
      command += ` -p ${port.host}:${port.guest}`;
    });
    function q(path: string): string {
      return path.includes(' ') ? `"${path}"` : path;
    }
    mappedFolders.value.forEach((mf, i) => {
      if (mf.host === '' && mf.guest === '') {
        return;
      }
      if (mf.host === '') {
        throw new Error(`Host path is empty in mapped folder #${i + 1}`);
      }
      if (mf.guest === '') {
        throw new Error(`Guest path is empty in mapped folder #${i + 1}`);
      }
      command += ` -v ${q(mf.host + ':' + mf.guest)}`;
    });
    command += ' ghcr.io/concrete5-community/docker5:' + matchedImage.value.tag;
    return {
      messageClass: '',
      result: command,
    };
  } catch (e: any) {
    return {
      messageClass: 'danger',
      result: e?.message || e.toString() || 'Unknown error',
    };
  }
});

const d5_copy = ref<HTMLButtonElement|null>(null);
function copyResult() {
  try {
    window.navigator.clipboard.writeText(resultLine.value.result);
  } catch (e: any) {
    window.alert(e.message || e.toString() || 'Unknown error');
    return;
  }
  if (d5_copy.value) {
    d5_copy.value.textContent = '\u2713';
    d5_copy.value.classList.remove('btn-secondary');
    d5_copy.value.classList.add('btn-success',);
    setTimeout(() => {
      if (d5_copy.value) {
        d5_copy.value.classList.remove('btn-success');
        d5_copy.value.classList.add('btn-secondary');
        d5_copy.value.textContent = '\ud83d\udccb';
      }
    }, 500);
  }
}
watch(imageKind, () => {
  if (versionDisplayName.value !== '' && ! versionDisplayNames.value.includes(versionDisplayName.value)) {
    versionDisplayName.value = '';
  }
  window.localStorage.setItem(LSKEYS.IMAGE_KIND, imageKind.value);
});

watch(versionDisplayName, () => {
  if (startingPoint.value !== '' && ! startingPoints.value.includes(startingPoint.value)) {
    startingPoint.value = '';
  }
  if (versionDisplayName.value === '') {
    window.localStorage.removeItem(LSKEYS.VERSION_DISPLAY_NAME);
  } else {
    window.localStorage.setItem(LSKEYS.VERSION_DISPLAY_NAME, versionDisplayName.value);
  }
});

watch(startingPoint, () => {
  if (startingPoint.value === '') {
    window.localStorage.removeItem(LSKEYS.STARTING_POINT);
  } else {
    window.localStorage.setItem(LSKEYS.STARTING_POINT, startingPoint.value);
  }
});

watch(openPorts, () => {
  const serialized: any[] = [];
  openPorts.value.forEach((port) => {
    serialized.push({
      guest: port.guest,
      expose: port.expose,
      host: port.host,
    });
  });
  window.localStorage.setItem(LSKEYS.OPEN_PORTS, JSON.stringify(serialized));
}, { deep: true });

onMounted(() => {
  const lsImageKind = window.localStorage.getItem(LSKEYS.IMAGE_KIND) as IMAGE_KINDS;
  if (lsImageKind) {
    imageKind.value = lsImageKind;
  }
  const lsVersionDisplayName = window.localStorage.getItem(LSKEYS.VERSION_DISPLAY_NAME);
  if (lsVersionDisplayName && versionDisplayNames.value.includes(lsVersionDisplayName)) {
    versionDisplayName.value = lsVersionDisplayName;
  }
  const lsStartingPoint = window.localStorage.getItem(LSKEYS.STARTING_POINT);
  if (lsStartingPoint && startingPoints.value.includes(lsStartingPoint)) {
    startingPoint.value = lsStartingPoint;
  }
  try {
    const lsOpenPorts = JSON.parse(window.localStorage.getItem(LSKEYS.OPEN_PORTS) || '[]');
    if (Array.isArray(lsOpenPorts)) {
      lsOpenPorts.forEach((p: any) => {
        if (!p || typeof p.expose !== 'boolean' || typeof p.guest !== 'number' && typeof p.host !== 'number' && p.host !== parseInt(p.host) || p.host < 1 || p.host > 65535) {
          return;
        }
        openPorts.value.some((openPort) => {
          if (openPort.guest !== p.guest) {
            return false;
          }
          openPort.expose = p.expose;
          openPort.host = p.host;
          return true;
        })
      });
    }
  } catch (e) {
    console.error(e);
  }
  try {
    const lsMappedFolders = JSON.parse(window.localStorage.getItem(LSKEYS.MAPPED_FOLDERS) || '[]');
    if (Array.isArray(lsMappedFolders)) {
      lsMappedFolders.forEach((mf: any) => {
        if (!mf || typeof mf.host !== 'string' || typeof mf.guest !== 'string') {
          return;
        }
        mappedFolders.value.push({
          host: mf.host,
          guest: mf.guest,
        });
      });
    }
    if (mappedFolders.value.length === 0) {
      mappedFolders.value.push({host: '', guest: ''});
    }
  } catch (e) {
    console.error(e);
  }
});

function autoFillGuestMappedFolder(mf: MappedFolder) {
  setTimeout(() => {
    debugger;
    if (mf.guest !== '') {
      return;
    }
    const host = mf.host.replace(/\\/g, '/').replace(/\/+$/, '');
    let i: RegExpMatchArray |null;
    if ((i = host.match(/\/packages\/(\w+)$/)) !== null) {
      mf.guest = '/app/packages/' + i[1];
      return;
    }
    if ((i = host.match(/\/blocks\/(\w+)$/)) !== null) {
      mf.guest = '/app/application/blocks/' + i[1];
      return;
    }
    if (host.match(/\/packages$/) !== null) {
      mf.guest = '/app/packages';
      return;
    }
    if (host.match(/\/blocks$/)) {
      mf.guest = '/app/application/blocks';
      return;
    }
  }, 50);
}

</script>

<style lang="css" scoped>
.d5-result textarea {
    resize: vertical;
    height: 7rem;
    padding-left: 1rem;
    padding-right: 1rem;
}
.d5-result {
  position: relative;
} 
.d5-copy {
  position: absolute;
  right: 0;
  opacity: 0.5;
  zoom: 0.6;
  transition: transform .2s;
}
.d5-copy:hover {
  opacity: 1;
  transform: scale(1.67) translate(-16.7%, 16.7%);
}
</style>
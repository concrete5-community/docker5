enum YN {
    Yes = 'Y',
    No = 'N',
}
interface RawEntry {
    php_version: string;
    composer_version: string;
    phpunit_version: string;
    c5_archive: string;
    c5_startingpoint: string;
    patch_environment_only: YN;
    install_blocks_cloner: YN;
    image_tag: string;
    additional_tags?: string;
    repo_branch?: string;
}

export interface ImageInfo {
    displayName: string,
    tag: string;
}

export interface ImageInfoActual {
    startingPoint: string;
    defaultPhpVersion: string;
    defaultComposerVersion: string;
    defaultPHPUnitVersion: string;
}

export interface StableImageInfoActual extends ImageInfo, ImageInfoActual {
    archiveUrl: string;
}
export interface StableImageInfoAlias extends ImageInfo {
    currently: StableImageInfoActual;
}

export interface DevelopImageInfoActual extends ImageInfo, ImageInfoActual {
    repo: string;
    branch: string;
}
export interface DevelopImageInfoAlias extends ImageInfo {
    currently: DevelopImageInfoActual;
}

import * as rawData from '../../data/matrix.json';
const rawEntries = (<any>rawData).default as RawEntry[];

export const stableImages: (StableImageInfoActual|StableImageInfoAlias)[] = [];
export const developImages: (DevelopImageInfoActual|DevelopImageInfoAlias)[] = [];

function getDisplayName(tag: string, prefix?: string): string
{
    tag = tag.replace(/-full$/, '');
    if (tag === 'latest') {
        return 'Latest';
    }
    tag = `v${tag}`;
    return prefix ? `${prefix} ${tag}` : tag;
}

rawEntries.forEach((entry) => {
    const parsed: any = {
        displayName: getDisplayName(entry.image_tag),
        tag: entry.image_tag,
        startingPoint: entry.c5_startingpoint,
        defaultPhpVersion: entry.php_version,
        defaultComposerVersion: entry.composer_version,
        defaultPHPUnitVersion: entry.phpunit_version,
    };
    const additionalTags = entry.additional_tags?.split(/\s+/).filter((tag) => tag !== '') || [];
    if (entry.repo_branch) {
        const match = <RegExpExecArray>/.*?github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)/.exec(entry.c5_archive);
        parsed.repo = `${match[1]}/${match[2]}`;
        parsed.branch = entry.repo_branch;
        additionalTags.forEach((tag) => {
            developImages.push({
                displayName: getDisplayName(tag, 'Last'),
                tag: tag,
                currently: parsed,
            });
        });
        developImages.push(parsed);
    } else {
        parsed.archiveUrl = entry.c5_archive;
        additionalTags.forEach((tag) => {
            stableImages.push({
                displayName: getDisplayName(tag, 'Last'),
                tag: tag,
                currently: parsed,
            });
        });
        stableImages.push(parsed);
    }
});

import { createSelector } from 'reselect';
import { convertHashToArray } from '../../core/helpers';
import { getConstants } from "../../core/selectors";

export const isDataLoaded = (state) => state.compatibleComponents.loaded;
export const getModules = (state) => state.compatibleComponents.modules;
export const getThemes = (state) => state.compatibleComponents.themes;
export const isAPISelected = (state) => state.compatibleComponents.apiSelected;
export const isDownloading = (state) => state.compatibleComponents.isDownloading;
export const getSelectedModuleFolders = (state) => state.compatibleComponents.selectedModuleFolders;
export const getSelectedThemeFolders = (state) => state.compatibleComponents.selectedThemeFolders;
export const isEditing = (state) => state.compatibleComponents.isEditing;
export const showComponentInfoModal = (state) => state.compatibleComponents.showComponentInfoModal;
export const getSelectedComponentTypeSection = (state) => state.compatibleComponents.selectedComponentTypeSection;
export const getAPI = (state) => state.compatibleComponents.api;
export const getCore = (state) => state.compatibleComponents.core;
export const getChangelogs = (state) => state.compatibleComponents.changelogs;
export const getComponentInfoModalContent = (state) => state.compatibleComponents.componentInfoModalContent; // TODO rename

// converts the hash of modules to an array
export const getModulesArray = createSelector(
    getModules,
    convertHashToArray
);

export const getThemesArray = createSelector(
    getThemes,
    convertHashToArray
);

const getSelectedModules = createSelector(
	getSelectedModuleFolders,
	getModules,
    (folders, modules) => folders.map((folder) => modules[folder])
);

const getSelectedThemes = createSelector(
    getSelectedThemeFolders,
    getThemes,
    (folders, themes) => folders.map((folder) => themes[folder])
);

// convenience method to return a flat, ordered array of all selected components in a standardized structure. Used on
// the non-editable list
export const getSelectedComponents = (state) => {
    var constants = getConstants(state);
	const components = [{
	    folder: 'core',
        name: 'Core',
        version: constants.core_version,
        type: 'core'
    }];

    if (isAPISelected(state)) {
		components.push({
            ...getAPI(state),
            type: 'api'
        });
	}

	getSelectedModules(state).forEach((module) => {
		components.push({ ...module, type: 'module' });
	});

    getSelectedThemes(state).forEach((theme) => {
        components.push({ ...theme, type: 'theme' });
    });

	return components;
};

export const allModulesSelected = createSelector(
    getModulesArray,
    getSelectedModuleFolders,
    (modules, folders) => modules.length === folders.length
);


/**
 * Returns all data needed for the component info modal, used on both the view and edit component list, including
 * prev & next links.
 *
 * @return object {
 *   isLoading: true|false,
 *   title: '',
 *   content: ''
 * }
 */
export const getComponentInfoModalInfo = createSelector(
    getComponentInfoModalContent,
    getCore,
    getAPI,
    getModules,
    getThemes,
    getChangelogs,
    isEditing,
    getSelectedComponentTypeSection,
    getSelectedComponents,
    (componentInfoModalContent, core, api, modules, themes, changelogs, isEditing, selectedComponentTypeSection, selectedComponents) => {
        const { componentType, folder } = componentInfoModalContent;
        const changelogLoaded = changelogs.hasOwnProperty(folder);

        const modalInfo = {
            title: '',
            type: componentType,
            folder,
            loaded: changelogLoaded,
	        isSelected: selectedComponents.find((row) => row.folder === folder) !== undefined,
            prevLinkEnabled: true,
            nextLinkEnabled: true
        };

        if (componentType === 'module') {
            modalInfo.title = modules[folder].name;
            modalInfo.desc = modules[folder].desc;
        } else if (componentType === 'theme') {
            modalInfo.title = themes[folder].name;
            modalInfo.desc = themes[folder].desc;
        } else if (componentType === 'api') {
            modalInfo.title = 'API';
            modalInfo.desc = api.desc;
        } else if (componentType === 'core') {
            modalInfo.title = 'Form Tools Core';
            modalInfo.desc = core.desc;
        }

        let list = [];
        if (isEditing) {
            let listMap = {
                modules: modules,
                themes: themes
            };

            if (listMap.hasOwnProperty(selectedComponentTypeSection)) {
                list = convertHashToArray(listMap[selectedComponentTypeSection]);
            } else {
                list = [{ folder: 'api'}];
            }
        } else {
            list = selectedComponents;
        }

        const index = list.findIndex(i => i.folder === folder);
        if (index === 0) {
            modalInfo.prevLinkEnabled = false;
        }
        if (list.length === 1 || list[list.length-1].folder === folder) {
            modalInfo.nextLinkEnabled = false;
        }

        modalInfo.data = changelogLoaded ? changelogs[folder] : [];

        return modalInfo;
    }
);


export const getPrevNextComponent = createSelector(
    getComponentInfoModalContent,
    getSelectedComponentTypeSection,
    getAPI,
    getModulesArray,
    getThemesArray,
    isEditing,
    getSelectedComponents,
    (componentInfoModalContent, editingComponentTypeSection, api, modules, themes, isEditing, selectedComponents) => {
        const prevNext = {
            prev: null,
            next: null
        };

        let list = [];
        if (isEditing) {
            let listMap = {
                modules: modules,
                themes: themes
            };
            if (listMap.hasOwnProperty(editingComponentTypeSection)) {
                list = listMap[editingComponentTypeSection];
            } else {
                list = [{ folder: 'api' }];
            }
        } else {
            list = selectedComponents;
        }

        const index = list.findIndex(i => i.folder === componentInfoModalContent.folder);

        if (index > 0) {
            const prev = list[index-1];
            prevNext.prev = {
                componentType: prev.type,
                folder: prev.folder
            };
        }
        if (index < list.length - 1) {
            const next = list[index+1];
            prevNext.next = {
                componentType: next.type,
                folder: next.folder
            };
        }

        return prevNext;
    }
);
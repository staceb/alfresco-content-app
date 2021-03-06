/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2018 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { Observable } from 'rxjs/Rx';
import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    NotificationService, TranslationService, TranslationMock,
    NodesApiService, AlfrescoApiService, ContentService,
    UserPreferencesService, LogService, AppConfigService,
    StorageService, CookieService, ThumbnailService, AuthenticationService,
    TimeAgoPipe, NodeNameTooltipPipe, FileSizePipe, NodeFavoriteDirective,
    DataTableComponent, UploadService
} from '@alfresco/adf-core';
import { DocumentListComponent } from '@alfresco/adf-content-services';
import { MatMenuModule, MatSnackBarModule, MatIconModule, MatDialogModule } from '@angular/material';
import { DocumentListService } from '@alfresco/adf-content-services';
import { ContentManagementService } from '../../common/services/content-management.service';
import { BrowsingFilesService } from '../../common/services/browsing-files.service';
import { NodeActionsService } from '../../common/services/node-actions.service';

import { FilesComponent } from './files.component';

describe('FilesComponent', () => {
    let node;
    let page;
    let fixture;
    let component: FilesComponent;
    let contentManagementService: ContentManagementService;
    let alfrescoContentService: ContentService;
    let uploadService: UploadService;
    let nodesApi: NodesApiService;
    let router: Router;
    let browsingFilesService: BrowsingFilesService;
    let nodeActionsService: NodeActionsService;
    let preferenceService: UserPreferencesService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatMenuModule,
                NoopAnimationsModule,
                HttpClientModule,
                TranslateModule.forRoot(),
                RouterTestingModule,
                MatSnackBarModule, MatIconModule,
                MatDialogModule
            ],
            declarations: [
                FilesComponent,
                DataTableComponent,
                TimeAgoPipe,
                NodeNameTooltipPipe,
                NodeFavoriteDirective,
                DocumentListComponent,
                FileSizePipe
            ],
            providers: [
                { provide: ActivatedRoute, useValue: {
                    params: Observable.of({ folderId: 'someId' }),
                    snapshot: { data: { preferencePrefix: 'prefix' } }
                } } ,
                { provide: TranslationService, useClass: TranslationMock },
                AuthenticationService,
                UserPreferencesService,
                AppConfigService, StorageService, CookieService,
                AlfrescoApiService,
                LogService,
                NotificationService,
                ContentManagementService,
                ContentService,
                NodesApiService,
                DocumentListService,
                ThumbnailService,
                NodeActionsService,
                UploadService,
                BrowsingFilesService
            ],
            schemas: [ NO_ERRORS_SCHEMA ]
        }).compileComponents()
        .then(() => {

            fixture = TestBed.createComponent(FilesComponent);
            component = fixture.componentInstance;

            contentManagementService = TestBed.get(ContentManagementService);
            uploadService = TestBed.get(UploadService);
            nodesApi = TestBed.get(NodesApiService);
            router = TestBed.get(Router);
            alfrescoContentService = TestBed.get(ContentService);
            browsingFilesService = TestBed.get(BrowsingFilesService);
            nodeActionsService = TestBed.get(NodeActionsService);
            preferenceService = TestBed.get(UserPreferencesService);
        });
    }));

    beforeEach(() => {
        node = { id: 'node-id', isFolder: true };
        page = {
            list: {
                entries: ['a', 'b', 'c'],
                pagination: {}
            }
        };
    });

    describe('OnInit', () => {
        it('set current node', () => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));

            fixture.detectChanges();

            expect(component.node).toBe(node);
        });

        it('get current node children', () => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));

            fixture.detectChanges();

            expect(component.paging).toBe(page);
        });

        it('emits onChangeParent event', () => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));
            spyOn(browsingFilesService.onChangeParent, 'next').and.callFake((val) => val);

            fixture.detectChanges();

            expect(browsingFilesService.onChangeParent.next)
                .toHaveBeenCalledWith(node);
        });

        it('raise error when fetchNode() fails', () => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.throw(null));
            spyOn(component, 'onFetchError');

            fixture.detectChanges();

            expect(component.onFetchError).toHaveBeenCalled();
        });

        it('raise error when fetchNodes() fails', () => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.throw(null));
            spyOn(component, 'onFetchError');

            fixture.detectChanges();

            expect(component.onFetchError).toHaveBeenCalled();
        });

        it('if should navigate to parent if node is not a folder', () => {
            node.isFolder = false;
            node.parentId = 'parent-id';
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(router, 'navigate');

            fixture.detectChanges();

            expect(router.navigate['calls'].argsFor(0)[0]).toEqual(['/personal-files', 'parent-id']);
        });
    });

    describe('refresh on events', () => {
        beforeEach(() => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));
            spyOn(component, 'load');

            fixture.detectChanges();
        });

        it('calls refresh onContentCopied event if parent is the same', () => {
            const nodes = [
                {  entry: { parentId: '1' } },
                {  entry: { parentId: '2' } }
            ];

            component.node =  <any>{ id: '1' };

            nodeActionsService.contentCopied.next(<any>nodes);

            expect(component.load).toHaveBeenCalled();
        });

        it('does not call refresh onContentCopied event when parent mismatch', () => {
            const nodes = [
                {  entry: { parentId: '1' } },
                {  entry: { parentId: '2' } }
            ];

            component.node =  <any>{ id: '3' };

            nodeActionsService.contentCopied.next(<any>nodes);

            expect(component.load).not.toHaveBeenCalled();
        });

        it('calls refresh onCreateFolder event', () => {
            alfrescoContentService.folderCreate.next();

            expect(component.load).toHaveBeenCalled();
        });

        it('calls refresh editFolder event', () => {
            alfrescoContentService.folderEdit.next();

            expect(component.load).toHaveBeenCalled();
        });

        it('calls refresh deleteNode event', () => {
            contentManagementService.nodeDeleted.next();

            expect(component.load).toHaveBeenCalled();
        });

        it('calls refresh moveNode event', () => {
            contentManagementService.nodeMoved.next();

            expect(component.load).toHaveBeenCalled();
        });

        it('calls refresh restoreNode event', () => {
            contentManagementService.nodeRestored.next();

            expect(component.load).toHaveBeenCalled();
        });

        it('calls refresh on fileUploadComplete event if parent node match', () => {
            const file = { file: { options: { parentId: 'parentId' } } };
            component.node =  <any>{ id: 'parentId' };

            uploadService.fileUploadComplete.next(<any>file);

            expect(component.load).toHaveBeenCalled();
        });

        it('does not call refresh on fileUploadComplete event if parent mismatch', () => {
            const file = { file: { options: { parentId: 'otherId' } } };
            component.node =  <any>{ id: 'parentId' };

            uploadService.fileUploadComplete.next(<any>file);

            expect(component.load).not.toHaveBeenCalled();
        });

        it('calls refresh on fileUploadDeleted event if parent node match', () => {
            const file = { file: { options: { parentId: 'parentId' } } };
            component.node =  <any>{ id: 'parentId' };

            uploadService.fileUploadDeleted.next(<any>file);

            expect(component.load).toHaveBeenCalled();
        });

        it('does not call refresh on fileUploadDeleted event if parent mismatch', () => {
            const file = { file: { options: { parentId: 'otherId' } } };
            component.node =  <any>{ id: 'parentId' };

            uploadService.fileUploadDeleted.next(<any>file);

            expect(component.load).not.toHaveBeenCalled();
        });
    });

    describe('fetchNode()', () => {
        beforeEach(() => {
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));
            spyOn(nodesApi, 'getNode').and.returnValue(Observable.of(node));

            fixture.detectChanges();
        });

        it('calls getNode api with node id', () => {
            component.fetchNode('nodeId');

            expect(nodesApi.getNode).toHaveBeenCalledWith('nodeId');
        });
    });

    describe('fetchNodes()', () => {
        beforeEach(() => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(nodesApi, 'getNodeChildren').and.returnValue(Observable.of(page));

            fixture.detectChanges();
        });

        it('calls getNode api with node id', () => {
            component.fetchNodes('nodeId');

            expect(nodesApi.getNodeChildren).toHaveBeenCalledWith('nodeId', jasmine.any(Object));
        });
    });

    describe('Create permission', () => {
        beforeEach(() => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));

            fixture.detectChanges();
        });

        it('returns false when node is not provided', () => {
            expect(component.canCreateContent(null)).toBe(false);
        });

        it('returns false when node does not have permission', () => {
            spyOn(alfrescoContentService, 'hasPermission').and.returnValue(false);

            expect(component.canCreateContent(node)).toBe(false);
        });

        it('returns false when node has permission', () => {
            spyOn(alfrescoContentService, 'hasPermission').and.returnValue(true);

            expect(component.canCreateContent(node)).toBe(true);
        });
    });

    describe('onNodeDoubleClick()', () => {
        beforeEach(() => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));

            fixture.detectChanges();
        });

        it('opens preview if node is file', () => {
            spyOn(router, 'navigate').and.stub();
            node.isFile = true;
            node.isFolder = false;

            const event: any = {
                detail: {
                    node: {
                        entry: node
                    }
                }
            };
            component.onNodeDoubleClick(event);

            expect(router.navigate['calls'].argsFor(0)[0]).toEqual(['./preview', node.id]);
        });

        it('navigate if node is folder', () => {
            spyOn(component, 'navigate').and.stub();
            node.isFolder = true;


            const event: any = {
                detail: {
                    node: {
                        entry: node
                    }
                }
            };
            component.onNodeDoubleClick(event);

            expect(component.navigate).toHaveBeenCalledWith(node.id);
        });
    });

    describe('load()', () => {
        let fetchNodesSpy;

        beforeEach(() => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            fetchNodesSpy = spyOn(component, 'fetchNodes');

            fetchNodesSpy.and.returnValue(Observable.of(page));

            fixture.detectChanges();
        });

        afterEach(() => {
            fetchNodesSpy.calls.reset();
        });

        it('shows load indicator', () => {
            spyOn(component, 'onPageLoaded');
            component.node = <any>{ id: 'currentNode' };

            expect(component.isLoading).toBe(false);

            component.load(true);

            expect(component.isLoading).toBe(true);
        });

        it('does not show load indicator', () => {
            spyOn(component, 'onPageLoaded');
            component.node = <any>{ id: 'currentNode' };

            expect(component.isLoading).toBe(false);

            component.load();

            expect(component.isLoading).toBe(false);
        });

        it('sets data on success', () => {
            component.node = <any>{ id: 'currentNode' };

            component.load();

            expect(component.paging).toBe(page);
            expect(component.pagination).toBe(page.list.pagination);
        });

        it('raise error on fail', () => {
            fetchNodesSpy.and.returnValue(Observable.throw(null));
            spyOn(component, 'onFetchError');

            component.load();

            expect(component.onFetchError).toHaveBeenCalled();
        });
    });

    describe('onBreadcrumbNavigate()', () => {
        beforeEach(() => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));

            fixture.detectChanges();
        });

        it('navigates to node id', () => {
            const routeData = <any>{ id: 'some-where-over-the-rainbow' };
            spyOn(component, 'navigate');

            component.onBreadcrumbNavigate(routeData);

            expect(component.navigate).toHaveBeenCalledWith(routeData.id);
        });
    });

    describe('Node navigation', () => {
        beforeEach(() => {
            spyOn(component, 'fetchNode').and.returnValue(Observable.of(node));
            spyOn(component, 'fetchNodes').and.returnValue(Observable.of(page));
            spyOn(router, 'navigate');

            fixture.detectChanges();
        });

        it('navigates to node when id provided', () => {
            component.navigate(node.id);

            expect(router.navigate).toHaveBeenCalledWith(['./', node.id], jasmine.any(Object));
        });

        it('navigates to home when id not provided', () => {
            component.navigate();

            expect(router.navigate).toHaveBeenCalledWith(['./'], jasmine.any(Object));
        });

        it('it navigate home if node is root', () => {
            (<any>component).node = {
                path: {
                    elements: [ {id: 'node-id'} ]
                }
            };

            component.navigate(node.id);

            expect(router.navigate).toHaveBeenCalledWith(['./'], jasmine.any(Object));
        });
    });

    describe('isSiteContainer', () => {
        it('should return false if node has no aspectNames', () => {
            const mock  = { aspectNames: [] };

            expect(component.isSiteContainer(mock)).toBe(false);
        });

        it('should return false if node is not site container', () => {
            const mock  = { aspectNames: ['something-else'] };

            expect(component.isSiteContainer(mock)).toBe(false);
        });

        it('should return true if node is a site container', () => {
            const mock  = { aspectNames: [ 'st:siteContainer' ] };

            expect(component.isSiteContainer(mock)).toBe(true);
        });
    });

    describe('onSortingChanged', () => {
        it('should save sorting input', () => {
            spyOn(preferenceService, 'set');

            const event = <any>{
                detail: {
                    key: 'some-name',
                    direction: 'some-direction'
                }
             };

            component.onSortingChanged(event);

            expect(preferenceService.set).toHaveBeenCalledWith('prefix.sorting.key', 'some-name');
            expect(preferenceService.set).toHaveBeenCalledWith('prefix.sorting.direction', 'some-direction');
        });

        it('should save default sorting when no input', () => {
            spyOn(preferenceService, 'set');

            const event = <any>{
                detail: {}
             };

            component.onSortingChanged(event);

            expect(preferenceService.set).toHaveBeenCalledWith('prefix.sorting.key', 'modifiedAt');
            expect(preferenceService.set).toHaveBeenCalledWith('prefix.sorting.direction', 'desc');
        });
    });
});

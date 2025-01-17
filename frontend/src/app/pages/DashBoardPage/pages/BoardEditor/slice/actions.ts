/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Modal } from 'antd';
import ChartDataView, {
  ChartDataViewFieldType,
} from 'app/pages/ChartWorkbenchPage/models/ChartDataView';
import { boardActions } from 'app/pages/DashBoardPage/slice';
import {
  ContainerWidgetContent,
  DataChart,
  FilterWidgetContent,
  RelatedView,
  Relation,
  Widget,
  WidgetFilterTypes,
} from 'app/pages/DashBoardPage/slice/types';
import {
  createInitWidgetConfig,
  createWidget,
} from 'app/pages/DashBoardPage/utils/widget';
import produce from 'immer';
import { RootState } from 'types';
import { v4 as uuidv4 } from 'uuid';
import { editBoardStackActions, editDashBoardInfoActions } from '.';
import { ChartEditorBaseProps } from '../components/ChartEditor';
import { BoardType } from './../../../slice/types';
import { WidgetFilterFormType } from './../components/FilterWidgetPanel/types';
import { addWidgetsToEditBoard, getEditWidgetDataAsync } from './thunk';
import { HistoryEditBoard } from './types';
const { confirm } = Modal;
export const deleteWidgetsAction = () => async (dispatch, getState) => {
  const editBoard = getState().editBoard as HistoryEditBoard;
  let selectedIds = Object.values(editBoard.widgetInfoRecord)
    .filter(WidgetInfo => WidgetInfo.selected)
    .map(WidgetInfo => WidgetInfo.id);
  // selectSelectedIds
  let childWidgetIds: string[] = [];
  const widgetMap = editBoard.stack.present.widgetRecord;
  selectedIds.forEach(id => {
    if (widgetMap[id].config.type === 'container') {
      const content = widgetMap[id].config.content as ContainerWidgetContent;
      Object.values(content.itemMap).forEach(item => {
        if (item.childWidgetId) {
          childWidgetIds.push(item.childWidgetId);
        }
      });
    }
  });
  if (childWidgetIds.length === 0) {
    dispatch(editBoardStackActions.deleteWidgets(selectedIds));
    return;
  }
  if (childWidgetIds.length > 0) {
    confirm({
      // TODO i18n
      title: '注意',
      content:
        '您要删除的组件中 有Container 组件，删除会将容器内的组件一起删除',
      onOk() {
        dispatch(editBoardStackActions.deleteWidgets(selectedIds));
      },
      onCancel() {
        childWidgetIds = [];
        return;
      },
    });
  }
};

/* widgetToPositionAsync */
export const widgetToPositionAction =
  (position: 'top' | 'bottom') => async (dispatch, getState) => {
    const editBoard = getState().editBoard as HistoryEditBoard;
    const widgetMap = editBoard.stack.present.widgetRecord;

    let curId = Object.values(editBoard.widgetInfoRecord).find(
      WidgetInfo => WidgetInfo.selected,
    )?.id;

    const sortedWidgets = Object.values(widgetMap)
      .filter(item => !item.parentId)
      .sort((w1, w2) => {
        return w1.config.index - w2.config.index;
      });
    let targetId: string = '';
    if (position === 'top') {
      targetId = sortedWidgets[sortedWidgets.length - 1].id;
    } else {
      targetId = sortedWidgets[0].id;
    }
    if (!curId || targetId === curId) return;
    dispatch(editBoardStackActions.changeTwoWidgetIndex({ curId, targetId }));
  };

export const updateWidgetFilterAction =
  (params: {
    boardId: string;
    boardType: BoardType;
    relations: Relation[];
    filterName?: string;
    fieldValueType: ChartDataViewFieldType;
    filterPositionType: WidgetFilterTypes;
    views: RelatedView[];
    widgetFilter: WidgetFilterFormType;
  }) =>
  async (dispatch, getState) => {
    const {
      boardId,
      boardType,
      views,
      widgetFilter,
      filterPositionType,
      relations,
      fieldValueType,
      filterName,
    } = params;
    const content: FilterWidgetContent = {
      type: filterPositionType || WidgetFilterTypes.Free,
      relatedViews: views,
      fieldValueType,
      widgetFilter: widgetFilter,
    };

    const widgetConf = createInitWidgetConfig({
      name: filterName || 'newFilter',
      type: 'filter',
      content: content,
      boardType: boardType,
    });

    const widgetId = relations?.[0].sourceId || uuidv4();
    const widget: Widget = createWidget({
      id: widgetId,
      dashboardId: boardId,
      config: widgetConf,
      relations,
    });
    dispatch(addWidgetsToEditBoard([widget]));
    dispatch(
      editDashBoardInfoActions.changeFilterPanel({
        type: 'hide',
        widgetId: '',
      }),
    );
  };
// changeChartEditorProps

export const editChartInWidgetAction =
  (props: {
    orgId: string;
    widgetId: string;
    chartName?: string;
    dataChartId: string;
    chartType: 'dataChart' | 'widgetChart';
  }) =>
  async (dispatch, getState) => {
    const {
      orgId,
      widgetId,
      dataChartId,
      chartType,
      chartName = 'widget_chart',
    } = props;
    const board = (getState() as RootState).board!;

    const dataChartMap = board.dataChartMap;
    const dataChart = dataChartMap[dataChartId];
    const viewMap = board?.viewMap;
    const withViewDataChart = produce(dataChart, draft => {
      draft.view = viewMap[draft.viewId];
      draft.name = chartType === 'widgetChart' ? chartName : draft.name;
    });
    const editorProps: ChartEditorBaseProps = {
      widgetId: widgetId,
      dataChartId: dataChartId,
      orgId,
      chartType: chartType,
      container: 'widget',
      originChart: withViewDataChart,
    };
    dispatch(editDashBoardInfoActions.changeChartEditorProps(editorProps));
  };
export const editWrapChartWidget =
  (props: { widgetId: string; dataChart: DataChart; view: ChartDataView }) =>
  async (dispatch, getState) => {
    const { dataChart, view, widgetId } = props;
    const dataCharts = [dataChart];
    const viewViews = [view];
    dispatch(boardActions.setDataChartMap(dataCharts));
    dispatch(boardActions.setViewMap(viewViews));
    dispatch(getEditWidgetDataAsync({ widgetId }));
  };

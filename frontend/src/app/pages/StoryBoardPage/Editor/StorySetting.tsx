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
import { Checkbox, Form, InputNumber } from 'antd';
import produce from 'immer';
import React, { memo, useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { StoryContext } from '../contexts/StoryContext';
import { storyActions } from '../slice';
import { makeSelectStoryBoardById } from '../slice/selectors';
import { updateStory } from '../slice/thunks';
import { StoryBoardState } from '../slice/types';
export interface StorySettingProps {}
export const StorySetting: React.FC<StorySettingProps> = memo(() => {
  const dispatch = useDispatch();
  const { stroyBoardId: storyId } = useContext(StoryContext);
  const storyBoard = useSelector((state: { storyBoard: StoryBoardState }) =>
    makeSelectStoryBoardById(state, storyId),
  );
  // TODO  add isLoop option -xieLiuDuo
  const autoPlay = storyBoard?.config?.autoPlay;
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({ ...autoPlay });
  }, [autoPlay, form]);

  const onValuesChange = useCallback(
    (_, allValue) => {
      const oldStory = storyBoard;
      const story = produce(oldStory, draft => {
        draft.config.autoPlay = allValue;
      });
      dispatch(updateStory({ story }));
    },
    [dispatch, storyBoard],
  );
  const clearSelectedPage = useCallback(() => {
    dispatch(storyActions.clearPageSelected(storyId));
  }, [dispatch, storyId]);

  return (
    <Wrap onClick={clearSelectedPage}>
      <Form
        onValuesChange={onValuesChange}
        size="small"
        form={form}
        layout="inline"
      >
        <Form.Item name="auto" label="自动播放" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item name="delay" label="每页时间(秒)">
          <InputNumber />
        </Form.Item>
      </Form>
    </Wrap>
  );
});
const Wrap = styled.div`
  display: block;
`;

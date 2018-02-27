//@flow

import { connect } from "react-redux";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  View
} from "react-native";
import React from "react";
import ErrorMessage from "../ErrorMessage";
import { DARK_BLUE } from "../../constants/ThingerColors";
import NavigationBar from "../navigation/NavigationBar";
import Screen from "../containers/Screen";
import {
  getResourceFromApi,
  getResourcesFromApi,
  postResource,
  runResource
} from "../../actions/fetch";
import { restartLiveResource, selectResource } from "../../actions/resource";
import { navigate } from "../../actions/nav";
import type { Device } from "../../types/Device";
import type { Attribute } from "../../types/Attribute";
import type { ResourcesState } from "../../types/State";
import { isMultipleResource } from "../../types/Resource";
import MultipleResourceView from "../resources/MultipleResource";
import type { MultipleResource, SimpleResource } from "../../types/Resource";
import SimpleResourceView from "../resources/SimpleResource";

type Props = {
  device: Device,
  resources: ResourcesState,
  onUpdateClick: (device: Device, resource: string) => any,
  onChartClick: (resource: string) => any,
  onGetResources: (device: Device) => any,
  onSettingsClick: () => any,
  onUpdateClick: (resource: string) => any,
  onPostClick: (id: string, value: Attribute) => any,
  onRun: (id: string) => any
};

class ResourcesScreen extends React.Component<Props> {
  constructor(props) {
    super(props);
    (this: any).onRefresh = this.onRefresh.bind(this);
  }

  onRefresh() {
    const { onGetResources, device } = this.props;
    onGetResources(device);
  }

  renderItem = ({ item }) => {
    const {
      resources,
      onUpdateClick,
      onPostClick,
      onChartClick,
      onRun
    } = this.props;

    if (isMultipleResource(resources[item].data)) {
      const data: MultipleResource = (resources[item].data: any);
      return (
        <MultipleResourceView
          resource={item}
          data={data || {}}
          isFetching={resources[item].isFetching}
          onUpdateClick={onUpdateClick}
          onPostClick={onPostClick}
          onChartClick={() => onChartClick(item)}
        />
      );
    } else {
      const data: SimpleResource = (resources[item].data: any);
      return (
        <SimpleResourceView
          resource={item}
          data={data || {}}
          isFetching={resources[item].isFetching}
          onUpdateClick={onUpdateClick}
          onPostClick={onPostClick}
          onChartClick={() => onChartClick(item)}
          onRun={onRun}
        />
      );
    }
  };

  renderItemList() {
    const { resources } = this.props;

    return (
      <KeyboardAvoidingView behavior="padding">
        <FlatList
          data={Object.keys(resources)}
          renderItem={this.renderItem}
          keyExtractor={item => item}
        />
        <View style={{ height: 65 }} />
      </KeyboardAvoidingView>
    );
  }

  render() {
    const { device, onSettingsClick } = this.props;

    return (
      <Screen
        navigationBar={
          <NavigationBar
            title={device ? device.dev : "Device"}
            button={{
              icon: "cog",
              onPress: onSettingsClick
            }}
          />
        }
      >
        {device &&
          (device.isFetching ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ActivityIndicator size="large" color={DARK_BLUE} />
            </View>
          ) : !device.isOnline ? (
            <ErrorMessage
              message={device.dev + " is offline"}
              icon="plug"
              onPressButton={this.onRefresh}
            />
          ) : !device.hasServerConnection ? (
            <ErrorMessage
              message={"Couldn't connect to\n" + device.server}
              icon="plug"
              onPressButton={this.onRefresh}
            />
          ) : !device.isAuthorized ? (
            <ErrorMessage
              message={device.usr + " isn't authorized"}
              icon="lock"
              onPressButton={this.onRefresh}
            />
          ) : (
            this.renderItemList()
          ))}
      </Screen>
    );
  }
}

const mapStateToProps = state => {
  const jti = state.selectedDevice;

  return {
    device: state.devices[jti],
    resources: state.resources
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onUpdateClick: (device, resource) => {
      dispatch(getResourceFromApi(device, resource));
    },
    onPostClick: (device, id, value) =>
      dispatch(postResource(device, id, value)),
    onRun: (device, id) => runResource(device, id),
    onChartClick: resource => {
      dispatch(restartLiveResource());
      dispatch(selectResource(resource));
      dispatch(navigate("Chart"));
    },
    onGetResources: device => {
      dispatch(getResourcesFromApi(device));
    },
    onSettingsClick: () => dispatch(navigate("Info"))
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, ownProps, stateProps, dispatchProps, {
    onUpdateClick: resource => {
      const { device } = stateProps;
      dispatchProps.onUpdateClick(device, resource);
    },
    onPostClick: (id, value) => {
      const { device } = stateProps;
      return dispatchProps.onPostClick(device, id, value);
    },
    onRun: id => {
      const { device } = stateProps;
      return dispatchProps.onRun(device, id);
    }
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  ResourcesScreen
);

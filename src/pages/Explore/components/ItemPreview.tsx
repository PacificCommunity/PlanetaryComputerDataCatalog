import {
  Image,
  ImageFit,
  ImageLoadState,
  Shimmer,
  ShimmerElementType,
  useTheme,
} from "@fluentui/react";
import { useCallback } from "react";
import { useBoolean } from "react-use";
import { IStacItem } from "types/stac";
import { makeItemPreviewUrl } from "utils";
import { useExploreSelector } from "../state/hooks";

interface ItemPreviewProps {
  item: IStacItem;
  size?: number;
  border?: "top" | "side";
}

const ItemPreview = ({ item, size = 100, border = "side" }: ItemPreviewProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useBoolean(true);
  const renderOption = useExploreSelector(s => s.mosaic.renderOption);

  const handleStateChange = useCallback(
    (state: ImageLoadState) => {
      setLoading(state === ImageLoadState.notLoaded);
    },
    [setLoading]
  );

  if (!renderOption) return null;

  const previewUrl = makeItemPreviewUrl(item, renderOption, size);

  return (
    <>
      {loading && (
        <Shimmer
          shimmerColors={{
            background: theme.palette.neutralLight,
            shimmer: theme.palette.white,
            shimmerWave: theme.palette.neutralLighter,
          }}
          shimmerElements={[
            { type: ShimmerElementType.line, height: size, width: size },
          ]}
        />
      )}
      <Image
        src={previewUrl}
        alt={`Rendered thumbnail for item: ${item.id}`}
        imageFit={ImageFit.contain}
        onLoadingStateChange={handleStateChange}
        styles={{
          root: {
            background: theme.palette.black,
            display: loading ? "none" : "block",
            borderRadius: border === "top" ? "4px 4px 0 0" : " 4px 0 0 4px",
            maxWidth: size,
            maxHeight: size,
            height: size,
          },
        }}
        data-cy="preview-thumbnail"
      />
    </>
  );
};

export default ItemPreview;

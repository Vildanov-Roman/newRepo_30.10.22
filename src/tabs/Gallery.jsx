import { Component } from 'react';

import * as ImageService from 'service/image-service';
import { Button, SearchForm, Grid, GridItem, Text, CardItem } from 'components';

export class Gallery extends Component {
  state = {
    query: '',
    images: [],
    page: 1,
    error: null,
    isLoading: false,
    isVisible: false,
    isEmpty: false,
  };

  onHandlerSubmit = value => {
    this.setState({
      query: value,
      images: [],
      page: 1,
      error: null,
      isLoading: false,
      isVisible: false,
      isEmpty: false,
    });
  };

  getFotos = async (query, page) => {
    if (!query) {
      return;
    }
    this.setState({ isLoading: true });
    try {
      const {
        photos,
        total_results,
        per_page,
        page: currentPage,
      } = await ImageService.getImages(query, page);
      console.log(photos);
      if (photos.length === 0) {
        this.setState({ isEmpty: true });
      }
      this.setState(prevState => ({
        images: [...prevState.images, ...photos],
        isVisible: currentPage < Math.ceil(total_results / per_page),
      }));
    } catch (error) {
      console.log(error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  onLoadMore = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  };

  componentDidUpdate(_, prevState) {
    const { query, page } = this.state;
    if (prevState.query !== query || prevState.page !== page) {
      this.getFotos(query, page);
    }
  }

  render() {
    const { images, isLoading, isVisible, isEmpty, error } = this.state;
    return (
      <>
        <SearchForm onSubmit={this.onHandlerSubmit} />
        {isEmpty && <Text>No images</Text>}
        {error && <Text>Sorry. There are no images ...</Text>}
        <Grid>
          {images.length > 0 &&
            images.map(({ id, avg_color, alt, src }) => (
              <GridItem key={id}>
                <CardItem color={avg_color}>
                  <img src={src.large} alt={alt} />
                </CardItem>
              </GridItem>
            ))}
        </Grid>
        {isVisible && (
          <Button onClick={this.onLoadMore}>
            {isLoading ? 'Please, wait a little...' : 'Load more'}
          </Button>
        )}
        {/* <Text textAlign="center">Sorry. There are no images ... 😭</Text> */}
      </>
    );
  }
}

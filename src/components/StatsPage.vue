<template>
  <section class="section" id="statPage">

    <div class="columns" style="padding-top: 10px;">
      <div class="column is-one-fiths">
        <chart ref="pie_stats_printing" :type="'pie'" :data="pie_stats_printing" :options="pie_stats_printing_options"></chart>
      </div>
      <div class="column is-four-fifths">

        <table class="table is-fullwidth is-striped is-hoverable" id="filestable">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Filename</th>
              <th><i class="fas fa-thumbs-up" style="color: #31cf65;"></i></th>
              <th><i class="fas fa-thumbs-down" style="color: #fc3c63;"></i></th>
              <th>last printdate</th>
              <th>last print</th>
            </tr>
          </thead>
          <tbody id="filesbody">
            <tr v-for="entry in printhistory">
              <td>
                <figure v-if="$localStorage.get('previewimages') == 'yes'" class="image is-64x64"><img :src="entry.file.img" :id="entry.file.thumbid" class="thumb" @error="imgFallback" v-on:mousemove="zoomIn($event, entry.file.thumbid, 'overlay_'+entry.file.imgid)" v-on:mouseleave="zoomOut(''+entry.file.imgid)"></figure>
                <div class="overlay_wrapper">
                  <div :id="'overlay_'+entry.file.imgid" class="zoomoverlay" v-bind:style="{'background-image': 'url(' + entry.file.img + ')' }"></div>
                </div>
              </td>
              <td>{{formatShorten(entry.file.name, 30)}}</td>
              <td>{{entry.file.prints.success}}</td>
              <td>{{entry.file.prints.failure}}</td>
              <td>{{formatDate(entry.date)}}</td>
              <td>
                <i class="fas" :class="{'fa-thumbs-up': entry.file.prints.last.success}" v-if="entry.file.prints.last.success" style="color: #31cf65;"></i>
                <i class="fas" :class="{'fa-thumbs-down': !entry.file.prints.last.success}" v-if="!entry.file.prints.last.success" style="color: #fc3c63;"></i>
              </td>
            </tr>
          </tbody>
        </table>

      </div>          
    </div>

  </section>
</template>

<script>
export default {
}
</script>